export class UserIdParam {
  userId: string;
  returnPrivateKey?: boolean;
  solana?: boolean;
}

export class UserIdAndAddressParam {
  userId: string;
  userAddress: string;
}

export class PrivateKeyParam {
  privateKey: string;
  userId: string;
  returnPrivateKey?: boolean;
  solana?: boolean;
}

export class SaveObservationDto {
  userId: string;
  observedAddress: string;
  tokenSymbol: string;
  chainName: string;
}
