import { DecryptCommand, EncryptCommand, KMSClient } from '@aws-sdk/client-kms';
import { Injectable, Logger } from '@nestjs/common';
import { config } from 'dotenv';

import { AccountRepository } from 'modules/database/repository/account.repository';
import { SettingsService } from 'modules/settings/settings.service';

config();

@Injectable()
export class ReencryptWalletsService {
  private readonly logger = new Logger(ReencryptWalletsService.name);
  private readyToReencrypt = false;
  private oldKmsClient: KMSClient;
  private newKmsClient: KMSClient;
  constructor(
    private readonly settingsService: SettingsService,
    private readonly accountRepository: AccountRepository,
  ) {
    if (
      process.env.FEATURE_REENCRYPT_USER_WALLETS === 'true' &&
      process.env.OLD_AWS_ACCESS_KEY_ID &&
      process.env.OLD_AWS_SECRET_ACCESS_KEY &&
      process.env.OLD_AWS_REGION &&
      process.env.OLD_AWS_KMS_KEY_ID
    ) {
      this.readyToReencrypt = true;
      const oldRegion = process.env.OLD_AWS_REGION;
      const oldAccessKeyId = process.env.OLD_AWS_ACCESS_KEY_ID;
      const oldSecretAccessKey = process.env.OLD_AWS_SECRET_ACCESS_KEY;

      this.oldKmsClient = new KMSClient({
        region: oldRegion,
        credentials: {
          accessKeyId: oldAccessKeyId,
          secretAccessKey: oldSecretAccessKey,
        },
      });

      this.newKmsClient = new KMSClient({
        region: this.settingsService.getSettings().kms.region,
        credentials: {
          accessKeyId: this.settingsService.getSettings().kms.accessKeyId,
          secretAccessKey: this.settingsService.getSettings().kms.secretAccessKey,
        },
      });
    }
  }

  public async reencryptWallets(): Promise<void> {
    try {
      if (this.readyToReencrypt) {
        this.logger.log('Reencrypting wallets');
        const accounts = await this.accountRepository.find({});
        for (const account of accounts) {
          const decryptedWallet = await this.decryptSecret(this.oldKmsClient, account.encryptedKey);
          const encryptedWallet = await this.encryptSecret(this.newKmsClient, decryptedWallet);
          await this.accountRepository.update(account.id, { encryptedKey: encryptedWallet });
        }
        this.logger.log('Reencrypting wallets completed');
      } else {
        this.logger.log('Not ready to reencrypt wallets');
      }
    } catch (err) {
      this.logger.error('Reencryption failed', err);
    }
  }

  async encryptSecret(kmsClient: KMSClient, secretKey: string): Promise<string> {
    const command = new EncryptCommand({
      KeyId: this.settingsService.getSettings().kms.keyId,
      Plaintext: Buffer.from(secretKey),
    });

    const response = await kmsClient.send(command);
    return response.CiphertextBlob ? Buffer.from(response.CiphertextBlob).toString('base64') : '';
  }

  async decryptSecret(kmsClient: KMSClient, encryptedSecret: string): Promise<string> {
    const command = new DecryptCommand({
      CiphertextBlob: Buffer.from(encryptedSecret, 'base64'),
    });

    const response = await kmsClient.send(command);
    return response.Plaintext ? Buffer.from(response.Plaintext).toString('utf-8') : '';
  }
}
