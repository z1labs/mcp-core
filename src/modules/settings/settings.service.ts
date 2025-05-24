import { Injectable, Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';

import { ChainType } from 'modules/blockchain/constants';

import { HttpService } from '@nestjs/axios';
import { AxiosRequestConfig } from 'axios';
import { SettingsIface } from './types';
dotenv.config();

const getEnv = (key: string): string | undefined => {
  const value = process.env[key];
  return value;
};

const getOrThrow = (key: string): string => {
  const value = getEnv(key);
  if (value == null) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};

export const convertStringToBoolean = (value?: string): boolean => {
  if (value == null) {
    return false;
  }
  return value.toLowerCase() === 'true';
};

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  constructor(private readonly httpService: HttpService) { }

  getSettings(): SettingsIface {
    const redisHost = getOrThrow('REDIS_HOST');
    const redisPort = getEnv('REDIS_PORT') ? parseInt(getOrThrow('REDIS_PORT')) : undefined;
    const redisPassword = getOrThrow('REDIS_PASSWORD');

    const nodeEnv = getOrThrow('NODE_ENV');
    return {
      env: {
        isTest: nodeEnv === 'test',
        isLocal: nodeEnv === 'local',
        isDev: nodeEnv === 'development',
        isProd: nodeEnv === 'production',
      },
      app: {
        nodeEnv,
        appPort: parseInt(getOrThrow('APP_PORT')),
        appUrl: getOrThrow('APP_URL'),
        swaggerPrefix: getOrThrow('SWAGGER_PREFIX'),
        corsOrigins: getOrThrow('CORS_ORIGINS')?.split(','),
        url: getOrThrow('APP_URL'),
      },
      database: {
        host: getOrThrow('DB_HOST'),
        port: parseInt(getOrThrow('DB_PORT')),
        name: getOrThrow('DB_NAME'),
        username: getOrThrow('DB_USER'),
        password: getOrThrow('DB_PASSWORD'),
        rejectUnauthorized: convertStringToBoolean(getEnv('DB_REJECT_UNAUTHORIZED')),
      },
      blockchain: {
        mode: getOrThrow('BLOCKCHAIN_MODE') as ChainType,
        chains: {
          ethereum: {
            rpcUrl: getOrThrow('ETHEREUM_RPC_URL'),
            blockExplorerUrl: getOrThrow('ETHEREUM_BLOCK_EXPLORER_URL'),
          },
          arbitrum: {
            rpcUrl: getOrThrow('ARBITRUM_RPC_URL'),
            blockExplorerUrl: getOrThrow('ARBITRUM_BLOCK_EXPLORER_URL'),
          },
          base: {
            rpcUrl: getOrThrow('BASE_RPC_URL'),
            blockExplorerUrl: getOrThrow('BASE_BLOCK_EXPLORER_URL'),
          },
          optimism: {
            rpcUrl: getOrThrow('OPTIMISM_RPC_URL'),
            blockExplorerUrl: getOrThrow('OPTIMISM_BLOCK_EXPLORER_URL'),
          },
          zksync: {
            rpcUrl: getOrThrow('ZKSYNC_RPC_URL'),
            blockExplorerUrl: getOrThrow('ZKSYNC_BLOCK_EXPLORER_URL'),
          },
          polygon: {
            rpcUrl: getOrThrow('POLYGON_RPC_URL'),
            blockExplorerUrl: getOrThrow('POLYGON_BLOCK_EXPLORER_URL'),
          },
          scroll: {
            rpcUrl: getOrThrow('SCROLL_RPC_URL'),
            blockExplorerUrl: getOrThrow('SCROLL_BLOCK_EXPLORER_URL'),
          },
          solana: {
            rpcUrl: getOrThrow('SOLANA_RPC_URL'),
            blockExplorerUrl: getOrThrow('SOLANA_BLOCK_EXPLORER_URL'),
          },
          bsc: {
            rpcUrl: getOrThrow('BSC_RPC_URL'),
            blockExplorerUrl: getOrThrow('BSC_BLOCK_EXPLORER_URL'),
          },
          gnosis: {
            rpcUrl: getOrThrow('GNOSIS_RPC_URL'),
            blockExplorerUrl: getOrThrow('GNOSIS_BLOCK_EXPLORER_URL'),
          },
          avalanche: {
            rpcUrl: getOrThrow('AVALANCHE_RPC_URL'),
            blockExplorerUrl: getOrThrow('AVALANCHE_BLOCK_EXPLORER_URL'),
          },
          fantom: {
            rpcUrl: getOrThrow('FANTOM_RPC_URL'),
            blockExplorerUrl: getOrThrow('FANTOM_BLOCK_EXPLORER_URL'),
          },
          aurora: {
            rpcUrl: getOrThrow('AURORA_RPC_URL'),
            blockExplorerUrl: getOrThrow('AURORA_BLOCK_EXPLORER_URL'),
          },
          hyper: {
            rpcUrl: getOrThrow('HYPER_RPC_URL'),
            blockExplorerUrl: getOrThrow('HYPER_BLOCK_EXPLORER_URL'),
          },
          sonic: {
            rpcUrl: getOrThrow('SONIC_RPC_URL'),
            blockExplorerUrl: getOrThrow('SONIC_BLOCK_EXPLORER_URL'),
          }
        },
      },
      keys: {
        jwtSecret: getOrThrow('JWT_SECRET'),
        openaiApiKey: getOrThrow('OPENAI_API_KEY'),
        deepSeekApiKey: getEnv('DEEP_SEEK_API_KEY'),
      },
      kms: {
        accessKeyId: getOrThrow('AWS_ACCESS_KEY_ID'),
        secretAccessKey: getOrThrow('AWS_SECRET_ACCESS_KEY'),
        region: getOrThrow('AWS_REGION'),
        keyId: getOrThrow('AWS_KMS_KEY_ID'),
      },
      gpt: {
        model: getOrThrow('GPT_MODEL'),
        historyMessages: parseInt(getOrThrow('HISTORY_MESSAGES')),
      },
      logger: {
        noColor: convertStringToBoolean(getEnv('NO_COLOR')),
      },
    };
  }

  public createRedisConnectionUrl(host?: string, port?: number, password?: string): string {
    return `redis://:${password}@${host}:${port ?? '6379'}`;
  }

  public async fetchWithRetry<T>(url: string, config: AxiosRequestConfig, maxRetries = 3, delayMs = 1000): Promise<T> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await this.httpService.axiosRef.get<T>(url, config);
        return response.data;
      } catch (error) {
        if ((error as any).response?.status === 429 && attempt < maxRetries - 1) {
          await new Promise((res) => setTimeout(res, delayMs));
          delayMs *= 2;
        } else {
          throw error;
        }
      }
    }
    throw new Error('Unable to fetch after multiple retries.');
  }
}
