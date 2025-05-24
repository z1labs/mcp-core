import { ChainNames, ChainType } from 'modules/blockchain/constants';

export interface SettingsIface {
  env: {
    isTest: boolean;
    isLocal: boolean;
    isDev: boolean;
    isProd: boolean;
  };
  app: {
    nodeEnv: string;
    appPort: number;
    appUrl: string;
    swaggerPrefix: string;
    corsOrigins: string[];
    url: string;
  };
  database: {
    host: string;
    port: number;
    name: string;
    username: string;
    password: string;
    rejectUnauthorized: boolean;
  };
  blockchain: {
    mode: ChainType;
    chains: {
      [key in ChainNames]: {
        rpcUrl: string;
        blockExplorerUrl: string;
      };
    };
  };
  keys: {
    jwtSecret: string;
    openaiApiKey: string;
    deepSeekApiKey?: string;
  };
  kms: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    keyId: string;
  };
  gpt: {
    model: string;
    historyMessages: number;
  };
  logger: {
    noColor: boolean;
  };
}
