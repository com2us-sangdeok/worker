import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ConvertPayload,
  LockPayload,
  MintPayload,
  PATTERN_MINT,
  UnlockPayload,
} from '../messages';
import {
  QueueException,
  QueueHttpStatus,
} from '../../exception/queue.exception';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AxiosClientUtil } from '../../util/axios-client.util';
import { QueueRepository } from '../repository/queue.repository';
import { MintLogEntity, TransactionEntity } from '../../entities';
import { MintLogStatus, TxStatus, TxType } from '../../enum';
import {
  GameApiException,
  GameApiHttpStatus,
} from '../../exception/request.exception';
import { ConfigService } from '@nestjs/config';
import { TxResult } from '../dto/queue.dto';
import {GameServerApiCode} from "../../enum/queue.enum";

@Injectable()
export class WorkerService {
  constructor(
    private configService: ConfigService,
    @Inject('DEAD-LETTERS') private client: ClientProxy,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
    private axiosClient: AxiosClientUtil,
    private workerRepository: QueueRepository,
  ) {}

  private readonly ConnectionError = [
    'PROTOCOL_CONNECTION_LOST',
    'ECONNREFUSED',
    'ECONNABORTED',
    'ECONNRESET',
  ];

  async mintEvent(payload: MintPayload) {
    let gameServerInfo;
    let replyForMint;
    try {
      gameServerInfo = await this.axiosClient.get(
        this.configService
          .get('BG_DETAIL_GAME_INFO')
          .replace('{APP_ID}', payload.appId),
      );
      if (gameServerInfo.status !== 200) {
        throw new GameApiException(
          'Betagame not found',
          '',
          GameApiHttpStatus.NOT_FOUND,
        );
      }

      // fixme: use apiLists
      // replyForMint = gameServerInfo.body.data.apiLists.filter(
      //   (item) => item.apiTypeCd === ApiTypeCode.NOTI_OF_COMPLETION_FOR_MINT,
      // )[0];
      replyForMint = gameServerInfo.body.data.apiTestLists.filter(
        (item) => item.apiTypeCd === GameServerApiCode.TX_RESULT,
      )[0];

      const mintLog = await this.workerRepository.getMintLogByRequestId(
        payload.requestId,
      );
      const serverInfo = mintLog.server.split(',');

      const replyToGameServer = await this.axiosClient.post(
        replyForMint.apiUrl,
        <TxResult>{
          result: 'success',
          playerId: payload.pid,
          server: serverInfo,
          // fixme: character id
          selectedCid: 'character',
          eventType: TxType.MINT,
          // fixme: mint type ? item, items, character
          items: [{ tokenId: payload.tokenId }],
        },
          {correlationId: payload.requestId}
      );
      if (
        !(replyToGameServer.status === 200 || replyToGameServer.status === 201)
      ) {
        throw new GameApiException(
          'Betagame not found',
          '',
          GameApiHttpStatus.NOT_FOUND,
        );
      }

      await this.workerRepository.updateMintLogByRequestId(<MintLogEntity>{
        requestId: payload.requestId,
        status: MintLogStatus.COMPLETE,
      });

      await this.workerRepository.updateTransactionByRequestId(<
        TransactionEntity
      >{
        requestId: payload.requestId,
        status: TxStatus.SUCCESS,
      });
    } catch (error) {
      // connection error
      if (this.ConnectionError.includes(error.code)) {
        // send msg to queue again
        const retryCount: number = payload.retryCount ?? Number(this.configService.get('Q_MAX_RETRY_COUNT'));
        if (retryCount === 0) {
          this.logger.error('can not try any more [retryCount: 0]');
          throw error;
        } else {
          this.logger.error('retry count:', retryCount);
          this.client.emit(PATTERN_MINT, {
            ...payload,
            retryCount: retryCount,
          });
          throw new QueueException('retry event', '', QueueHttpStatus.RETRY_EVENT);
        }
      } else {
        throw error;
      }
    }
  }

  async convertEvent(payload: ConvertPayload) {
    try {
      this.logger.log(`payload: ${payload}`);
      // todo: convert log update
      //   call game server to complete
      //   update convert pool
    } catch (e) {
      throw new QueueException(
        e.message,
        e,
        QueueHttpStatus.CONVERTING_PROCESS_FAILED,
      );
    }
  }

  async lockEvent(payload: LockPayload) {
    try {
      this.logger.log(`payload: ${payload}`);
      // todo: lock log update
      //   call game server to complete
    } catch (e) {
      throw new QueueException(
        e.message,
        e,
        QueueHttpStatus.LOCKING_PROCESS_FAILED,
      );
    }
  }

  async unlockEvent(payload: UnlockPayload) {
    try {
      this.logger.log(`payload: ${payload}`);
      // todo: unlock log update
      //   call game server to complete
    } catch (e) {
      throw new QueueException(
        e.message,
        e,
        QueueHttpStatus.UNLOCKING_PROCESS_FAILED,
      );
    }
  }
}
