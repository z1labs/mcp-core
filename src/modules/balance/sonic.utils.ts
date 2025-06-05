import { Injectable, Logger } from '@nestjs/common';
import { ChainNames, getChainIdByName } from 'modules/blockchain/constants';
import { ExecuteSwapDto } from 'modules/blockchain/dto/params';

interface TokenInfo {
  name: string;
  address: string;
  symbol: string;
  decimals: number;
}

@Injectable()
export class SonicUtils {
  private readonly logger = new Logger(SonicUtils.name);
  private readonly MAGPIEFI_API_URL = 'https://api.magpiefi.xyz';
  private readonly ODOS_QUOTE_URL = 'https://api.odos.xyz/sor/quote/v2';
  private readonly ODOS_ASSEMBLE_URL = 'https://api.odos.xyz/sor/assemble';

  private readonly HYPER_SONIC_TOKENS_API = 'https://api.hypersonic.exchange/v1/tokens/sonic/full';
  private readonly PAIRS_API_URL = 'https://api.shadow.so/mixed-pairs';

  public async resolveTokenAddress(tokenSymbolOrAddress: string): Promise<{
    address: string;
    isNative: boolean;
  }> {
    if (tokenSymbolOrAddress.trim().toLowerCase() === 'ws') {
      return { address: '0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38', isNative: false };
    }

    if (tokenSymbolOrAddress.trim().toLocaleLowerCase() === 'shadow') {
      return { address: '0x3333b97138d4b086720b5ae8a7844b1345a33333', isNative: false };
    }

    if (tokenSymbolOrAddress.trim().startsWith('0x')) {
      return { address: tokenSymbolOrAddress, isNative: false };
    }

    const tokenAddress = await this.getTokenAddressByTicker(tokenSymbolOrAddress);

    if (!tokenAddress) {
      throw new Error(`No address found for token symbol: ${tokenSymbolOrAddress}`);
    }

    return { address: tokenAddress, isNative: false };
  }

  private async getTokenAddressByTicker(ticker: string): Promise<string | null> {
    const tokenLookup = await this.fetchTokenList();
    const targetTicker = ticker.toLowerCase();
    const candidate = Object.values(tokenLookup).find((t) => t.symbol.toLowerCase() === targetTicker);
    return candidate ? candidate.address.toLocaleLowerCase() : null;
  }

  private async fetchTokenList(): Promise<Record<string, TokenInfo>> {
    const tokenMapping: Record<string, TokenInfo> = {};
    try {
      const responsePairs = await fetch(this.PAIRS_API_URL);
      if (responsePairs.ok) {
        const data = await responsePairs.json();
        let tokensArray: any[];
        if (data.tokens && Array.isArray(data.tokens)) {
          tokensArray = data.tokens.flat();
        } else if (Array.isArray(data)) {
          tokensArray = data;
        } else {
          this.logger.error('Unexpected token list format from PAIRS API');
          tokensArray = [];
        }
        for (const token of tokensArray) {
          const address = token.id.toLowerCase();
          if (!tokenMapping[address]) {
            tokenMapping[address] = {
              name: token.name,
              address: token.id,
              symbol: token.symbol,
              decimals: token.decimals,
            };
          }
        }
      } else {
        this.logger.error(`Failed to fetch token list: ${responsePairs.statusText}`);
      }
    } catch (error) {
      this.logger.error('Error fetching token list from PAIRS API:', error);
    }
    try {
      const responseHypersonic = await fetch(this.HYPER_SONIC_TOKENS_API);
      if (responseHypersonic.ok) {
        const data = await responseHypersonic.json();
        if (Array.isArray(data)) {
          for (const token of data) {
            const address = token.address.toLowerCase();
            if (!tokenMapping[address]) {
              tokenMapping[address] = {
                name: token.name,
                address: token.address,
                symbol: token.symbol,
                decimals: token.decimals,
              };
            }
          }
        } else {
          this.logger.error('Unexpected token list format from hypersonic API');
        }
      } else {
        this.logger.error(`Failed to fetch token list from hypersonic API: ${responseHypersonic.statusText}`);
      }
    } catch (error) {
      this.logger.error('Error fetching token list from hypersonic API:', error);
    }
    return tokenMapping;
  }

  public async fetchMagpieQuote(
    userAddress: string,
    tokenInAddress: string,
    tokenOutAddress: string,
    amountInRaw: string,
  ): Promise<any | null> {
    const quoteParams = {
      network: ChainNames.SONIC,
      fromTokenAddress: tokenInAddress,
      toTokenAddress: tokenOutAddress,
      sellAmount: amountInRaw.toString(),
      slippage: '0.005',
      fromAddress: userAddress.toLocaleLowerCase(),
      toAddress: userAddress.toLocaleLowerCase(),
      gasless: 'false',
    };
    const quoteQuery = new URLSearchParams(quoteParams as Record<string, string>).toString();
    const quoteUrl = `${this.MAGPIEFI_API_URL}/aggregator/quote?${quoteQuery}`;

    const quoteResponse = await fetch(quoteUrl);

    if (!quoteResponse.ok) {
      return null;
    }
    return await quoteResponse.json();
  }

  public async fetchOdosQuote(
    userAddress: string,
    tokenInAddress: string,
    tokenOutAddress: string,
    amountInRaw: string,
  ): Promise<any> {
    const odosQuoteRequestBody = {
      chainId: getChainIdByName(ChainNames.SONIC),
      inputTokens: [
        {
          tokenAddress: tokenInAddress,
          amount: amountInRaw.toString(),
        },
      ],
      outputTokens: [
        {
          tokenAddress: tokenOutAddress,
          proportion: 1,
        },
      ],
      slippageLimitPercent: 0.5,
      userAddr: userAddress.toLocaleLowerCase(),
      referralCode: 0,
      disableRFQs: true,
      compact: true,
    };

    this.logger.log(`Odos Quote URL: ${this.ODOS_QUOTE_URL}`);
    const odosQuoteResponse = await fetch(this.ODOS_QUOTE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(odosQuoteRequestBody),
    });
    if (!odosQuoteResponse.ok) {
      this.logger.error(`Failed to fetch Odos quote: ${odosQuoteResponse.statusText}`);
      throw new Error(`Failed to fetch Odos quote: ${odosQuoteResponse.statusText}`);
    }
    return await odosQuoteResponse.json();
  }

  public async fetchMagpieTransaction(quoteId: string): Promise<any> {
    const txUrl = `${this.MAGPIEFI_API_URL}/aggregator/transaction?quoteId=${quoteId}`;
    this.logger.log(txUrl);
    const txResponse = await fetch(txUrl);
    if (!txResponse.ok) {
      this.logger.error(`Failed to fetch transaction data: ${txResponse.statusText}`);
      return null;
    }
    return await txResponse.json();
  }

  public async fetchOdosTx(args: ExecuteSwapDto, odosQuoteData: any): Promise<any> {
    const { userAddress } = args;
    const assembleRequestBody = {
      userAddr: userAddress.toLocaleLowerCase(),
      pathId: odosQuoteData.pathId,
      simulate: false,
    };

    this.logger.log(`Odos Assemble URL: ${this.ODOS_ASSEMBLE_URL}`);
    const assembleResponse = await fetch(this.ODOS_ASSEMBLE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assembleRequestBody),
    });
    if (!assembleResponse.ok) {
      this.logger.error(`Failed to assemble transaction: ${assembleResponse.statusText}`);
      throw new Error(`Failed to assemble transaction: ${assembleResponse.statusText}`);
    }
    const assembleData = await assembleResponse.json();
    const tx = assembleData.transaction;

    const txForEthers = {
      ...tx,
      gasLimit: tx.gas,
    };
    delete txForEthers.gas;

    return txForEthers;
  }
}
