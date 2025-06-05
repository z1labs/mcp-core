import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { BaseContract, BigNumber, ethers } from 'ethers';

import { SettingsService } from 'modules/settings/settings.service';

import { ChainNames, ContractType, getContractAbi } from './constants';
import { ERC20Abi } from './contract-types';
import { TokenMetadataDto } from './dto/params';

@Injectable()
export class EvmUtils implements OnModuleInit {
  private readonly logger = new Logger(EvmUtils.name);
  private providers: Record<ChainNames, ethers.providers.JsonRpcProvider>;

  constructor(
    private readonly settingsService: SettingsService, // @Optional() @Inject(forwardRef(() => FeeService)) // private readonly feeService?: FeeService
  ) {}

  public async onModuleInit(): Promise<void> {
    this.providers = {
      [ChainNames.ETHEREUM]: new ethers.providers.JsonRpcProvider(
        this.settingsService.getSettings().blockchain.chains[ChainNames.ETHEREUM].rpcUrl,
      ),
      [ChainNames.ARBITRUM]: new ethers.providers.JsonRpcProvider(
        this.settingsService.getSettings().blockchain.chains[ChainNames.ARBITRUM].rpcUrl,
      ),
      [ChainNames.BASE]: new ethers.providers.JsonRpcProvider(
        this.settingsService.getSettings().blockchain.chains[ChainNames.BASE].rpcUrl,
      ),
      [ChainNames.OPTIMISM]: new ethers.providers.JsonRpcProvider(
        this.settingsService.getSettings().blockchain.chains[ChainNames.OPTIMISM].rpcUrl,
      ),
      [ChainNames.POLYGON]: new ethers.providers.JsonRpcProvider(
        this.settingsService.getSettings().blockchain.chains[ChainNames.POLYGON].rpcUrl,
      ),
      [ChainNames.ZKSYNC]: new ethers.providers.JsonRpcProvider(
        this.settingsService.getSettings().blockchain.chains[ChainNames.ZKSYNC].rpcUrl,
      ),
      [ChainNames.SCROLL]: new ethers.providers.JsonRpcProvider(
        this.settingsService.getSettings().blockchain.chains[ChainNames.SCROLL].rpcUrl,
      ),
      [ChainNames.BSC]: new ethers.providers.JsonRpcProvider(
        this.settingsService.getSettings().blockchain.chains[ChainNames.BSC].rpcUrl,
      ),
      [ChainNames.GNOSIS]: new ethers.providers.JsonRpcProvider(
        this.settingsService.getSettings().blockchain.chains[ChainNames.GNOSIS].rpcUrl,
      ),
      [ChainNames.AVALANCHE]: new ethers.providers.JsonRpcProvider(
        this.settingsService.getSettings().blockchain.chains[ChainNames.AVALANCHE].rpcUrl,
      ),
      [ChainNames.FANTOM]: new ethers.providers.JsonRpcProvider(
        this.settingsService.getSettings().blockchain.chains[ChainNames.FANTOM].rpcUrl,
      ),
      [ChainNames.AURORA]: new ethers.providers.JsonRpcProvider(
        this.settingsService.getSettings().blockchain.chains[ChainNames.AURORA].rpcUrl,
      ),
      [ChainNames.SOLANA]: new ethers.providers.JsonRpcProvider(undefined),
      [ChainNames.HYPER]: new ethers.providers.JsonRpcProvider(
        this.settingsService.getSettings().blockchain.chains[ChainNames.HYPER].rpcUrl,
      ),
      [ChainNames.SONIC]: new ethers.providers.JsonRpcProvider(
        this.settingsService.getSettings().blockchain.chains[ChainNames.SONIC].rpcUrl,
      ),
      [ChainNames.CYPHER]: new ethers.providers.JsonRpcProvider(
        this.settingsService.getSettings().blockchain.chains[ChainNames.CYPHER].rpcUrl,
      ),
    };
  }

  public getProvider(chainName: ChainNames): ethers.providers.JsonRpcProvider {
    return this.providers[chainName];
  }

  public getSigner(chainName: ChainNames, privateKey: string): ethers.Wallet {
    return new ethers.Wallet(privateKey, this.getProvider(chainName));
  }

  public getContract<T extends BaseContract>(
    chainName: ChainNames,
    address: string,
    abi: ethers.ContractInterface,
    signer?: ethers.Signer,
  ): T {
    return new ethers.Contract(address, abi, signer || this.getProvider(chainName)) as unknown as T;
  }

  public async getBalanceERC20(chainName: ChainNames, address: string, contractAddress: string): Promise<string> {
    const contract = this.getContract<ERC20Abi>(chainName, contractAddress, getContractAbi(ContractType.ERC20));
    const balance: BigNumber = await contract.balanceOf(address);
    return balance.toString();
  }

  public async getBalanceNative(chainName: ChainNames, address: string): Promise<string> {
    const provider = this.getProvider(chainName);
    const balance = await provider.getBalance(address);
    return balance.toString();
  }

  public async getErc20Decimals(chainName: ChainNames, contractAddress: string): Promise<number> {
    const contract = this.getContract<ERC20Abi>(chainName, contractAddress, getContractAbi(ContractType.ERC20));
    const decimals = await contract.decimals();
    return Number(decimals);
  }

  public toEth(wei: ethers.BigNumberish, decimals: number = 18): string {
    return ethers.utils.formatUnits(wei, decimals);
  }

  public async getTokenMetadata(chainName: ChainNames, contractAddress: string): Promise<TokenMetadataDto> {
    const contract = this.getContract<ERC20Abi>(chainName, contractAddress, getContractAbi(ContractType.ERC20));
    return {
      name: await contract.name(),
      symbol: await contract.symbol(),
      address: contractAddress,
    };
  }
}
