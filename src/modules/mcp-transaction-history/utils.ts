import {DeBankChainsData} from "./constants";

export const getDeBankExplorerUrlForTx = (chainId: string, tx: string): string => {
    return `${DeBankChainsData[chainId].url}/tx/${tx}`;
};

export const getDeBankExplorerUrlForAddress = (chainId: string, address: string): string => {
    return `${DeBankChainsData[chainId].url}/address/${address}`;
};


export const getDeBankExplorerLogo = (chainId: string): string => {
    return `${DeBankChainsData[chainId].logo}`;
};

export const getDeBankChainName = (chainId: string): string => {
    return `${DeBankChainsData[chainId].name}`;
};
