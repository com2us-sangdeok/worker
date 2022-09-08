import { Injectable } from '@nestjs/common';
import { BlockchainService } from '../blockchain/blockchain.service';
import { MsgSend, Tx, Wallet } from '@terra-money/terra.js';
import { SignMode } from '@terra-money/terra.proto/cosmos/tx/signing/v1beta1/signing';
import { Coinbalance } from './modules.inerface';
import { DataSource, QueryRunner } from 'typeorm';
import {
  GameApiException,
  GameApiHttpStatus,
} from '../../exception/request.exception';

@Injectable()
export class CommonService {
  private bc = this.blockchainService.blockChainClient();
  private lcd = this.blockchainService.lcdClient();

  constructor(
    private readonly blockchainService: BlockchainService,
    private dataSource: DataSource,
  ) {}

  public async sign(wallet: Wallet, tx: Tx): Promise<Tx> {
    const walletInfo = await wallet.accountNumberAndSequence();
    try {
      const sign = await wallet.key.signTx(tx, {
        chainID: this.lcd.config.chainID,
        signMode: SignMode.SIGN_MODE_LEGACY_AMINO_JSON,
        sequence: walletInfo.sequence,
        accountNumber: walletInfo.account_number,
      });
      return sign;
    } catch (err) {
      console.log(err);
    }
  }

  public async getBalance(address: string): Promise<Coinbalance[]> {
    return await this.bc.client.getBalance(address);
  }

  public async transferCoin(
    sender: string,
    receiver: string,
    amount: string,
    denom: string,
  ): Promise<MsgSend> {
    return new MsgSend(sender, receiver, amount + denom);
  }

  // TODO. game-api 서버에서 broadcast 기능 없애야함
  // Queue에 넣고 consumer에서 처리
  public async broadCast(signedTx: Tx): Promise<any> {
    return await this.lcd.tx.broadcastSync(signedTx);
  }
}
