import axios from 'axios';
import {Injectable, Logger} from '@nestjs/common';
import {TransactionInfo, TransactionInfoAdvanced, UserWalletParams} from './dto/params';
import {SettingsService} from 'modules/settings/settings.service';
import {UserRepository} from 'modules/database/repository/user.repository';
import {
    getDeBankExplorerUrlForTx,
    getDeBankExplorerUrlForAddress,
    getDeBankExplorerLogo,
    getDeBankChainName
} from './utils';

@Injectable()
export class McpTransactionHistoryService {
    private readonly logger = new Logger(McpTransactionHistoryService.name);

    constructor(
        private readonly settingsService: SettingsService,
        private readonly userRepository: UserRepository
    ) {
    }

    private readonly apiUrl = 'https://pro-openapi.debank.com';
    private readonly headers = {
        accept: 'application/json',
        AccessKey: process.env.DEBANK_ACCESS_KEY ?? '',
    };

    public async getDeBankAllTransactionHistoryWalletConnected(
        walletParams: UserWalletParams,
    ): Promise<TransactionInfo[]> {

        const userId = walletParams?.userId ?? '';
        const user = await this.userRepository.getUserById(userId);
        if (!user?.walletAddress) {
            throw new Error('User wallet not found');
        }


        const walletAddress = walletParams.walletAddress;

        return await this.getDeBankAllHistoryListData(walletAddress, '');
    }

    public async getDeBankAllTransactionHistoryByAddress(
        walletParams: UserWalletParams,
    ): Promise<TransactionInfo[]> {

        const walletAddress = walletParams.walletAddress;

        return await this.getDeBankAllHistoryListData(walletAddress, '');
    }

    public async getDeBankHistoryWalletByWalletAddress(
        walletParams: UserWalletParams,
        chain: string,
    ): Promise<TransactionInfo[]> {
        return [];
    }

    private async getDeBankAllHistoryListData(
        walletAddress: string,
        chain: string,
    ): Promise<TransactionInfo[]> {

        const apiMethod = '/v1/user/all_history_list';

        try {
            const params: Record<string, string> = {
                id: walletAddress,
                page_count: '20',
            };
            if (chain) {
                params.chain_id = chain;
            }

            const url = `${this.apiUrl}${apiMethod}?${new URLSearchParams(params).toString()}`;
            const response = await axios.get(url, {headers: this.headers});
            const list =
                response.data?.data || response.data?.history_list || response.data || [];
            const filtered = (Array.isArray(list) ? list : []).filter(
                (tx: any) => !tx.is_scam && !tx.is_spam && !tx.isSpam,
            );

            const resultFiltered = filtered.map((tx: any) => {
                const chainName = getDeBankChainName(tx.chain)
                const sends = tx.sends && tx.sends.length ? tx.sends[0] : undefined;
                const receives = tx.receives && tx.receives.length ? tx.receives[0] : undefined;
                const tokenId = sends?.token_id || receives?.token_id;
                const tokenSymbol =
                    (tokenId && response.data.token_dict?.[tokenId]?.symbol) || tx.token_symbol || tx.native_token_symbol || '';

                let action = '';

                if (tx.sends.length > 0) {
                    action = 'send';
                } else if (tx.receives.length > 0) {
                    action = 'received';
                }


                return {
                    chainName: chainName,
                    accountChainLink: getDeBankExplorerUrlForAddress(tx.chain, walletAddress),
                    link: getDeBankExplorerUrlForTx(tx.chain, tx.id) || '',
                    token: tokenSymbol,
                    to: getDeBankExplorerUrlForAddress(tx.chain, sends?.to_addr) || getDeBankExplorerUrlForAddress(tx.chain, receives?.to_addr) || getDeBankExplorerUrlForAddress(tx.chain, tx.other_addr) || '',
                    protocol: tx.project_id ? response.data.project_dict?.[tx.project_id]?.name : undefined,
                    protocolLogo: getDeBankExplorerLogo(tx.chain) || undefined,
                    cex: tx.cex_id ? response.data.cex_dict?.[tx.cex_id]?.name : undefined,
                    action: action,
                    amountSends: sends,
                    amountRecives: receives,
                    timeTx: tx.time_at,
                    // fee: tx.tx?.eth_gas_fee,
                } as TransactionInfoAdvanced;
            });

            return resultFiltered;

        } catch (e) {
            this.logger.error(`Failed to fetch history: ${e}`);
            return [];
        }
    }


    private async getDeBankAllTxHistoryListFromApiWithFilterSpam(
        walletAddress: string,
        chain: string,
        startTime: number
    ): Promise<TransactionInfo[]> {

        const apiMethod = '/v1/user/all_history_list';

        try {
            const params: Record<string, string> = {
                id: walletAddress,
                page_count: '20',
            };
            if (chain) {
                params.chain_id = chain;
            }

            if (startTime) {
                params.start_time = startTime.toString();
            }

            const url = `${this.apiUrl}${apiMethod}?${new URLSearchParams(params).toString()}`;
            const response = await axios.get(url, {headers: this.headers});
            const list =
                response.data?.data || response.data?.history_list || response.data || [];
            const filtered = (Array.isArray(list) ? list : []).filter(
                (tx: any) => !tx.is_scam && !tx.is_spam && !tx.isSpam,
            );

            return filtered.map((tx: any) => {
                const chainName = getDeBankChainName(tx.chain)
                const sends = tx.sends && tx.sends.length ? tx.sends[0] : undefined;
                const receives = tx.receives && tx.receives.length ? tx.receives[0] : undefined;
                const tokenId = sends?.token_id || receives?.token_id;
                const tokenSymbol =
                    (tokenId && response.data.token_dict?.[tokenId]?.symbol) || tx.token_symbol || tx.native_token_symbol || '';
                const amount = sends?.amount || receives?.amount;
                return {
                    chainName: chainName,
                    accountChainLink: getDeBankExplorerUrlForAddress(tx.chain, walletAddress),
                    link: getDeBankExplorerUrlForTx(tx.chain, tx.id) || '',
                    token: tokenSymbol,
                    to: getDeBankExplorerUrlForAddress(tx.chain, sends?.to_addr) || getDeBankExplorerUrlForAddress(tx.chain, receives?.to_addr) || getDeBankExplorerUrlForAddress(tx.chain, tx.other_addr) || '',
                    protocol: tx.project_id ? response.data.project_dict?.[tx.project_id]?.name : undefined,
                    protocolLogo: getDeBankExplorerLogo(tx.chain) || undefined,
                    cex: tx.cex_id ? response.data.cex_dict?.[tx.cex_id]?.name : undefined,
                    amount,
                    fee: tx.tx?.eth_gas_fee,
                } as TransactionInfo;
            });
        } catch (e) {
            this.logger.error(`Failed to fetch history: ${e}`);
            return [];
        }
    }
}
