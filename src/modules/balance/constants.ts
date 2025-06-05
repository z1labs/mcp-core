import { config } from 'dotenv';
import { ethers } from 'ethers';

import ERC20Abi from './contracts/ERC20.abi.json';
import MCPContextStorage from './contracts/MCPContextStorage.abi.json';

config();

export enum ContractType {
  ERC20 = 'ERC20',
  MCPContextStorage = 'MCPContextStorage',
}

const contractAbi = {
  [ContractType.ERC20]: ERC20Abi as ethers.ContractInterface,
  [ContractType.MCPContextStorage]: MCPContextStorage as ethers.ContractInterface,
};

export const getContractAbi = (contractType: ContractType): ethers.ContractInterface => {
  return contractAbi[contractType];
};

export enum ChainType {
  MAINNET = 'mainnet',
  TESTNET = 'testnet',
}

export enum ChainNames {
  ETHEREUM = 'ethereum',
  ARBITRUM = 'arbitrum',
  BASE = 'base',
  OPTIMISM = 'optimism',
  ZKSYNC = 'zksync',
  POLYGON = 'polygon',
  SCROLL = 'scroll',
  SOLANA = 'solana',
  BSC = 'bsc',
  GNOSIS = 'gnosis',
  AVALANCHE = 'avalanche',
  FANTOM = 'fantom',
  AURORA = 'aurora',
  HYPER = 'hyper',
  SONIC = 'sonic',
  CYPHER = 'cypher',
}

const mainnetChainIds = {
  [ChainNames.ETHEREUM]: 1,
  [ChainNames.ARBITRUM]: 42161,
  [ChainNames.BASE]: 8453,
  [ChainNames.OPTIMISM]: 10,
  [ChainNames.ZKSYNC]: 324,
  [ChainNames.POLYGON]: 137,
  [ChainNames.SCROLL]: 534352,
  [ChainNames.BSC]: 56,
  [ChainNames.GNOSIS]: 100,
  [ChainNames.AVALANCHE]: 43114,
  [ChainNames.FANTOM]: 250,
  [ChainNames.AURORA]: 1313161554,
  [ChainNames.HYPER]: 999,
  [ChainNames.SONIC]: 146,
  [ChainNames.SOLANA]: 0,
};

const testnetChainIds = {
  [ChainNames.ETHEREUM]: 11155111,
  [ChainNames.ARBITRUM]: 421614,
  [ChainNames.BASE]: 8453,
  [ChainNames.OPTIMISM]: 11155420,
  [ChainNames.POLYGON]: 80002,
  [ChainNames.SCROLL]: 2227728, // l1sload devnet, not actual Scroll testnet
  [ChainNames.BSC]: 97,
  [ChainNames.GNOSIS]: 10200,
  [ChainNames.AVALANCHE]: 43113,
  [ChainNames.FANTOM]: 4002,
  [ChainNames.AURORA]: 1313161555,
  [ChainNames.SOLANA]: 0,
};

export const ChainId = process.env.BLOCKCHAIN_MODE === ChainType.MAINNET ? mainnetChainIds : testnetChainIds;

export const getChainIdByName = (chainName: ChainNames): number => {
  return ChainId[chainName];
};

export const getChainNameById = (chainId: number): ChainNames => {
  const result = Object.values(ChainNames).find((chainName) => ChainId[chainName] === chainId);
  if (!result) {
    throw new Error(`ChainId ${chainId} not found`);
  }
  return result;
};

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
export const ZERO_BNB_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
export const ZERO_ARB_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
export const ZERO_HYPER_ADDRESS = '0x5555555555555555555555555555555555555555';
export const NATIVE_TOKEN_ADDRESS = '0x4200000000000000000000000000000000000006';
