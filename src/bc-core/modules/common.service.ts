import { Injectable } from '@nestjs/common';
import { BlockchainService } from '../blockchain/blockchain.service';
import { MsgSend, Tx, Wallet } from '@terra-money/terra.js';
import { SignMode } from '@terra-money/terra.proto/cosmos/tx/signing/v1beta1/signing';
import { Coinbalance } from './modules.inerface';
import { DataSource, QueryRunner } from 'typeorm';
import { SequenceRepository } from '../../queue/repository/sequence.repository';
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
    private sequenceRepository: SequenceRepository,
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

  //todo 대납 상황에 맞춰서 다시 개발 필요
  public async getSequenceNumber(accAddress: string): Promise<any> {
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction('SERIALIZABLE');
    try {
      const sequenceFromBlockchain: number = (
        await this.blockchainService
          .blockChainClient()
          .client.account(accAddress)
      ).sequence;

      let sequenceFromDB: number = (
        await this.sequenceRepository.getSequenceNumber(queryRunner, accAddress)
      ).sequenceNumber;

      if (sequenceFromDB === -1) {
        // init sequence number
        await this.sequenceRepository.registerSequence(
          queryRunner,
          accAddress,
          sequenceFromBlockchain,
        );
        sequenceFromDB = sequenceFromBlockchain;
      } else if (sequenceFromDB < sequenceFromBlockchain) {
        // sync sequence number between DB and blockchain network
        await this.sequenceRepository.updateSequenceFromBlockchain(
          queryRunner,
          accAddress,
          sequenceFromBlockchain,
        );
        sequenceFromDB = sequenceFromBlockchain;
      }

      await this.sequenceRepository.updateSequenceFromDb(
        queryRunner,
        accAddress,
        sequenceFromDB,
      );
      await queryRunner.commitTransaction();
      return sequenceFromBlockchain;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw new GameApiException(
        e.message,
        e.stack,
        GameApiHttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }
  }
}
