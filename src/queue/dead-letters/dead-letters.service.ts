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
import { ConfigService } from '@nestjs/config';
import { QueueRepository } from '../repository/queue.repository';
import { EventErrorEntity } from '../../entities/event-error.entity';
import { MintLogStatus, TxStatus, TxType } from '../../enum';
import { AxiosClientUtil } from '../../util/axios-client.util';
import {
  GameApiException,
  GameApiHttpStatus,
} from '../../exception/request.exception';
// import { ApiTypeCode } from '../../enum/queue.enum';
import { MintLogEntity, TransactionEntity } from '../../entities';
import { TxResultDto } from '../dto/queue.dto';
import {GameServerApiCode} from "../../enum/queue.enum";

@Injectable()
export class DeadLettersService {
  constructor(
    private configService: ConfigService,
    private axiosClient: AxiosClientUtil,
    @Inject('WORKER')
    private client: ClientProxy,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
    private workerRepository: QueueRepository,
  ) {}

  private readonly ConnectionErrorType = [
    'PROTOCOL_CONNECTION_LOST',
    'ECONNREFUSED',
    'ECONNABORTED',
    'ECONNRESET',
  ];

  async mintEvent(payload: MintPayload) {
    let retryCount = payload.retryCount ?? 0;
    let gameServerInfo;
    let replyForMint;
    try {

      if (retryCount === 0) {
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
          <TxResultDto>{
            result: 'failure',
            requestId: '',
            playerId: payload.pid,
            server: serverInfo,
            selectedCid: 'characterId',
            eventType: TxType.MINT,
            //fixme: mint type ? item, items, character
            // items: [{tokenId: payload.tokenId},],
          },
        );
        if (!(replyToGameServer.status === 200 || replyToGameServer.status === 201)) {
          throw new GameApiException(
            'Betagame not found',
            '',
            GameApiHttpStatus.NOT_FOUND,
          );
        }

        throw new QueueException(
          'transaction failed',
          '',
          QueueHttpStatus.TRANSACTION_FAILED,
        );

      } else {
          // await sleep(Number(this.configService.get('Q_DELAY_TIME')));
        retryCount -= 1;
        this.logger.debug(`Retry(${retryCount}) of tx for ${payload.requestId}`);
        await this.client.emit(PATTERN_MINT, {
          ...payload,
          retryCount: retryCount,
        });
      }
    } catch (error) {

      try {
        await this.workerRepository.registerEventError(<EventErrorEntity>{
          requestId: payload.requestId,
          txType: TxType.MINT,
          txHash: payload.txHash,
          appId: payload.appId,
          playerId: Number(payload.pid),
          message: error.message,
        });

        await this.workerRepository.updateMintLogByRequestId(<MintLogEntity>{
          requestId: payload.requestId,
          status: MintLogStatus.FAILURE,
        });

        await this.workerRepository.updateTransactionByRequestId(<
          TransactionEntity
        >{
          requestId: payload.requestId,
          status: TxStatus.FAIL,
        });
        this.logger.debug('update status with failure')
      } catch (e) {
        this.logger.error('error occurred while inserting data into db')
        this.client.emit(PATTERN_MINT, {
          payload,
        });
      }
    }
  }

  convertEvent(payload: ConvertPayload) {
    try {
      this.logger.log(`payload: ${payload}`);
      // todo: convert log update
      //   call game server to complete
      //   update convert pool
    } catch (e) {
      throw new QueueException(
        e.message,
        e,
        QueueHttpStatus.CONVERT_FAILED,
      );
    }
  }

  lockEvent(payload: LockPayload) {
    try {
      this.logger.log(`payload: ${payload}`);
      // todo: lock log update
      //   call game server to complete
    } catch (e) {
      throw new QueueException(
        e.message,
        e,
        QueueHttpStatus.LOCK_FAILED,
      );
    }
  }

  unlockEvent(payload: UnlockPayload) {
    try {
      this.logger.log(`payload: ${payload}`);
      // todo: unlock log update
      //   call game server to complete
    } catch (e) {
      throw new QueueException(
        e.message,
        e,
        QueueHttpStatus.UNLOCK_FAILED,
      );
    }
  }
}
