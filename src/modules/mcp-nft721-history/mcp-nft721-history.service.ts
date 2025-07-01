import {Injectable, Logger} from '@nestjs/common';
import {ethers} from 'ethers';
import {ChainNames, ContractType, getContractAbi} from 'modules/blockchain/constants';
import {EvmUtils} from 'modules/blockchain/evm.utils';
import {UserRepository} from 'modules/database/repository/user.repository';
import {HistoryService} from 'modules/agent/history.service';
import {SettingsService} from 'modules/settings/settings.service';
import {KmsService} from 'modules/kms/kms.service';
import { create, KuboRpcClient, CID } from 'kubo-rpc-client';

@Injectable()
export class McpNft721HistoryService {
    private readonly logger = new Logger(McpNft721HistoryService.name);
    private client: KuboRpcClient;

    constructor(
        private readonly evmUtils: EvmUtils,
        private readonly settingsService: SettingsService,
        private readonly userRepository: UserRepository,
        private readonly kmsService: KmsService,
        private readonly historyService: HistoryService,
    ) {
        this.client = create({ url: 'https://ipfs.io' });
    }

    public async putContext(
        userId: string
    ): Promise<string> {

        const contractAddress = this.settingsService.getSettings().contracts.mcpNftContext;
        const abi = getContractAbi(ContractType.MCPNftContext);

        const user = await this.userRepository.getUserById(userId);
        if (!user?.walletAddress) {
            throw new Error('User wallet not found');
        }

        const {encryptedKey} = await this.userRepository.getUserAccount2(
            userId
        );
        const privateKey = await this.kmsService.decryptSecret(encryptedKey);
        const signer = this.evmUtils.privateKeyToSigner(
            ChainNames.CYPHER,
            privateKey,
        );

        const contract = this.evmUtils.getContract<ethers.Contract>(
            ChainNames.CYPHER,
            contractAddress,
            abi,
            signer,
        );

        const history = await this.historyService.getHistory(userId);
        const uploadMetadataResult = await this.uploadMetadata(JSON.stringify(history));
        const contextURI = uploadMetadataResult.url;

        try {
            const tokenId = await contract.getTokenIdByUser(user.walletAddress);

            const tx = await contract.putContext(tokenId, user.walletAddress, contextURI);
            const receipt = await tx.wait();
            const txHash: string = receipt.transactionHash;
            const txLink = this.evmUtils.explorerUrlForTx(ChainNames.CYPHER, txHash);

            if (!parseInt(tokenId)) {
                return `\n<a href="${txLink}" target="_blank">Your AI Chat History NFT (ERC-721) has been created!</a>`;
            }
        } catch (e) {
            this.logger.error(e);
        }
        return '';
    }

    private async uploadMetadata(metadata: any): Promise<{ cid: string; url: string }> {
        const jsonStr = JSON.stringify(metadata);
        const { cid } = await this.client.add(jsonStr);
        const cidStr = cid.toString ? cid.toString() : String(cid);
        const url = `https://ipfs.io/ipfs/${cidStr}`;
        return { cid: cidStr, url };
    }
}
