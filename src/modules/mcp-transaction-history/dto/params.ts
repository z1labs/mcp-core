import {getDeBankExplorerLogo, getDeBankExplorerUrlForAddress, getDeBankExplorerUrlForTx} from "../utils";

export interface TransactionInfo {
  link: string;
  token: string;
  to: string;
  protocol?: string;
  cex?: string;
  amount?: number;
  fee?: number;
}

export interface TransactionInfoAdvanced {
  chainName: string,
  accountChainLink: string,
  link: string,
  token: string,
  to: string,
  protocol?: string,
  protocolLogo: string,
  cex?: string,
  action: string,
  amountSends: [],
  amountRecives: [],
  timeTx?: number,
  // fee?: number,
}

export interface UserWalletParams {
  userId: string;
  walletAddress: string;
  content: string;
}
