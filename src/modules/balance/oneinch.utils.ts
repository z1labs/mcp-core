import { Injectable, Logger } from '@nestjs/common';

import { ChainNames, getChainIdByName } from 'modules/balance/constants';
import { SettingsService } from 'modules/settings/settings.service';

export interface FetchTokenAddressParam {
  chainName: string;
  symbol: string;
}

type TokenApiSearchResponse = Array<{
  symbol: string;
  chainId: number;
  name: string;
  address: string;
  decimals: number;
}>;

@Injectable()
export class OneInchUtils {
  constructor(private readonly settingsService: SettingsService) {
    this.ONE_INCH_API_URL = settingsService.getSettings().oneinch.apiUrl;
    this.ONE_INCH_API_KEY = settingsService.getSettings().oneinch.apiKey;
  }

  private readonly ONE_INCH_API_URL: string;
  private readonly ONE_INCH_API_KEY: string;
  private readonly logger = new Logger(OneInchUtils.name);

  public async fetchTokenAddressByTicker(args: FetchTokenAddressParam): Promise<{ address: string } | null> {
    const { chainName, symbol } = args;
    try {
      const chainId = getChainIdByName(chainName as ChainNames);
      const endpoint = `/v1.2/${chainId}/search`;
      const url = `${this.ONE_INCH_API_URL + 'token'}${endpoint}`;

      const params = {
        query: symbol,
        limit: 10,
        ignore_listed: 'false',
      };

      const headers = {
        Authorization: `Bearer ${this.ONE_INCH_API_KEY}`,
        accept: 'application/json',
      };

      let foundAddress: string | undefined;

      try {
        const desiredSymbol = symbol.toUpperCase();
        this.logger.log(`-> 1inch fetch: ${JSON.stringify([url, { params, headers }])}`);

        let tokensList;
        tokensList = await this.settingsService.fetchWithRetry<TokenApiSearchResponse>(url, { params, headers });
        for (const token of tokensList) {
          if (token.symbol.toUpperCase() === desiredSymbol) {
            foundAddress = token.address;
            break;
          }
        }
        if (!Array.isArray(tokensList)) {
          return null;
        }
      } catch (err) {
        this.logger.error('Error fetching token data from 1inch:', err);
      }

      if (!foundAddress) {
        return null;
      }

      return { address: foundAddress };
    } catch (err) {
      this.logger.error('Failed to fetch token data from 1inch:', err);
      return null;
    }
  }
}
