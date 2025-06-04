import { Injectable, Logger } from '@nestjs/common';
import { ethers } from 'ethers';
import { ChainNames, ContractType, getContractAbi } from 'modules/blockchain/constants';
import { EvmUtils } from 'modules/blockchain/evm.utils';
import { UserRepository } from 'modules/database/repository/user.repository';
import { SettingsService } from 'modules/settings/settings.service';
import { KmsService } from 'modules/kms/kms.service';

@Injectable()
export class McpContextStorageService {
    private readonly logger = new Logger(McpContextStorageService.name);

    constructor(
        private readonly evmUtils: EvmUtils,
        private readonly settingsService: SettingsService,
        private readonly userRepository: UserRepository,
        private readonly kmsService: KmsService,
    ) {}

    public async putContext(
        userId: string,
        lastContextIds: { id: string }[],
    ): Promise<string> {
        const contextIds = lastContextIds.map((item) => item.id);

        const contractAddress =
            this.settingsService.getSettings().contracts.mcpContextStorage;
        const abi = getContractAbi(ContractType.MCPContextStorage);

        const user = await this.userRepository.getUserById(userId);
        if (!user?.walletAddress) {
            throw new Error('User wallet not found');
        }

        const { encryptedKey } = await this.userRepository.getUserAccount2(
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

        const tx = await contract.putContext(user.walletAddress, contextIds);
        const receipt = await tx.wait();
        const txHash: string = receipt.transactionHash;
        const txLink = this.evmUtils.explorerUrlForTx(ChainNames.CYPHER, txHash);

        return `\n<span style="color:#4D4E52">Context updated. View</span> <a href="${txLink}" target="_blank">transaction</a>`;
    }
}
