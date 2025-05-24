import { DecryptCommand, EncryptCommand, KMSClient } from '@aws-sdk/client-kms';
import { Injectable, Logger } from '@nestjs/common';

import { AccountRepository } from 'modules/database/repository/account.repository';
import { SettingsService } from 'modules/settings/settings.service';

@Injectable()
export class KmsService {
  private readonly kmsClient: KMSClient;
  private readonly logger = new Logger(KmsService.name);
  constructor(
    private readonly settingsService: SettingsService,
    private readonly accountRepository: AccountRepository,
  ) {
    this.kmsClient = new KMSClient({
      region: this.settingsService.getSettings().kms.region,
      credentials: {
        accessKeyId: this.settingsService.getSettings().kms.accessKeyId,
        secretAccessKey: this.settingsService.getSettings().kms.secretAccessKey,
      },
    });
  }

  async saveNewServiceKey(secretKey: string): Promise<void> {
    const encryptedKey = await this.encryptSecret(secretKey);
    const account = await this.accountRepository.find({
      where: {
        encryptedKey,
      },
    });
    if (account) {
      throw new Error('This key already exist');
    }
  }

  async encryptSecret(secretKey: string): Promise<string> {
    const command = new EncryptCommand({
      KeyId: this.settingsService.getSettings().kms.keyId,
      Plaintext: Buffer.from(secretKey),
    });

    const response = await this.kmsClient.send(command);
    return response.CiphertextBlob ? Buffer.from(response.CiphertextBlob).toString('base64') : '';
  }

  async decryptSecret(encryptedSecret: string): Promise<string> {
    const command = new DecryptCommand({
      CiphertextBlob: Buffer.from(encryptedSecret, 'base64'),
    });

    const response = await this.kmsClient.send(command);
    return response.Plaintext ? Buffer.from(response.Plaintext).toString('utf-8') : '';
  }
}
