import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  BurnPayload,
  ConvertPayload,
  LockPayload,
  MintPayload, PATTERN_BURN,
  PATTERN_CONVERT, PATTERN_LOCK,
  PATTERN_MINT, PATTERN_UNLOCK,
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
import { TxResultDto } from '../dto/queue.dto';
import { GameServerApiCode } from '../../enum/queue.enum';

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
          'betagame not found',
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
          result: 'success',
          requestId: payload.requestId,
          playerId: payload.pid,
          server: serverInfo,
          // fixme: character id
          selectedCid: 'character',
          eventType: TxType.MINT,
          // fixme: mint type ? item, items, character
          items: [{ tokenId: payload.tokenId }],
        },
        { correlationId: payload.requestId },
      );
      if (
        !(replyToGameServer.status === 200 || replyToGameServer.status === 201)
      ) {
        throw new GameApiException(
          'failed to respond on game server',
          '',
          GameApiHttpStatus.NOT_FOUND,
        );
      }

      await this.workerRepository.updateMintLogByRequestId(<MintLogEntity>{
        requestId: payload.requestId,
        status: MintLogStatus.COMPLETE,
      });

      // await this.workerRepository.updateTransactionByRequestId(<
      //   TransactionEntity
      // >{
      //   requestId: payload.requestId,
      //   status: TxStatus.SUCCESS,
      // });
    } catch (error) {
      this.errorHandler(error, payload, PATTERN_MINT);
      // // connection error
      // if (this.ConnectionError.includes(error.code)) {
      //   // send msg to queue again
      //   const retryCount: number =
      //     payload.retryCount ??
      //     Number(this.configService.get('Q_MAX_RETRY_COUNT'));
      //   if (retryCount === 0) {
      //     this.logger.error('can not try any more [retryCount: 0]');
      //     throw error;
      //   } else {
      //     this.logger.error('retry count:', retryCount);
      //     this.client.emit(PATTERN_MINT, {
      //       ...payload,
      //       retryCount: retryCount,
      //     });
      //     throw new QueueException(
      //       'retry mint event',
      //       '',
      //       QueueHttpStatus.RETRY_EVENT,
      //     );
      //   }
      // } else {
      //   throw error;
      // }
    }
  }

  async convertEvent(payload: ConvertPayload) {
    try {
      const gameServerData = await this.getBetaGameData(payload.appId);

      // fixme: change the test code (update item)
      // const gameServerApi = gameServerData.body.data.apiLists.filter(
      //   (item) => item.apiTypeCd === GameServerApiCode.TX_RESULT,
      // )[0];
      const gameServerConvertApi = gameServerData.apiTestLists.filter(
          (item) => item.apiTypeCd === GameServerApiCode.CONVERT,
      )[0];


      // todo: convert type에 따른 처리
      //   db 조회 후 값 세팅
      this.workerRepository
      payload.convertType

      const serverInfo = ['']; //mintLog.server.split(',');
      await this.axiosClient.patch(gameServerConvertApi.apiUrl, {
        requestId: payload.requestId,
        characterId: 'character',
        goodsCode: 'payload.pid',
        amount: 0,
        type: 'TxType.MINT',
      },{
        appId: payload.appId,
        server: serverInfo,
        playerId: payload.pid,
      })


      // fixme: change the test code (tx result)
      // const gameServerApi = gameServerData.body.data.apiLists.filter(
      //   (item) => item.apiTypeCd === GameServerApiCode.TX_RESULT,
      // )[0];
      const gameServerApi = gameServerData.apiTestLists.filter(
        (item) => item.apiTypeCd === GameServerApiCode.TX_RESULT,
      )[0];

      await this.getGameServerData(gameServerApi.apiUrl, {
        result: 'success',
        requestId: payload.requestId,
        playerId: payload.pid,
        server: serverInfo,
        selectedCid: 'character',
        eventType: TxType.MINT,
        // fixme: mint type ? item, items, character
        items: [{}],
      });

      // todo: update the table about convert
      //  reply txinfo
    } catch (error) {
      this.errorHandler(error, payload, PATTERN_CONVERT);
    }
  }

  async lockEvent(payload: LockPayload) {
    try {
      this.logger.log(`payload: ${payload}`);
      const gameServerData = await this.getBetaGameData(payload.appId);

      // fixme: change the test code (update item)
      // const gameServerApi = gameServerData.body.data.apiLists.filter(
      //   (item) => item.apiTypeCd === GameServerApiCode.TX_RESULT,
      // )[0];
      const gameServerConvertApi = gameServerData.apiTestLists.filter(
          (item) => item.apiTypeCd === GameServerApiCode.CONVERT,
      )[0];


      // todo: lock log update
      //   call game server to complete
    } catch (error) {
      this.errorHandler(error, payload, PATTERN_LOCK);
    }
  }

  async unlockEvent(payload: UnlockPayload) {
    try {
      this.logger.log(`payload: ${payload}`);
      // todo: unlock log update
      //   call game server to complete
    } catch (error) {
      this.errorHandler(error, payload, PATTERN_UNLOCK);
    }
  }

  async burnEvent(payload: BurnPayload) {
    try {
      this.logger.log(`payload: ${payload}`);
      // todo: unlock log update
      //   call game server to complete
    } catch (error) {
      this.errorHandler(error, payload, PATTERN_BURN);
    }
  }

  private async getBetaGameData(appId: string): Promise<any> {
    const betaGameData = await this.axiosClient.get(
      this.configService.get('BG_DETAIL_GAME_INFO').replace('{APP_ID}', appId),
    );
    if (betaGameData.status !== 200) {
      throw new GameApiException(
        'failed to respond on console server',
        '',
        GameApiHttpStatus.EXTERNAL_SERVER_ERROR,
      );
    }
    if (betaGameData.body.code === 404) {
      throw new GameApiException(
        'betagame not found',
        '',
        GameApiHttpStatus.EXTERNAL_SERVER_ERROR,
      );
    }
    return betaGameData.body.data;
  }

  private async getGameServerData(
    url: string,
    params: TxResultDto,
  ): Promise<any> {
    const gameServerData = await this.axiosClient.post(
      url,
      <TxResultDto>{
        result: params.result,
        playerId: params.playerId,
        server: params.server,
        selectedCid: params.selectedCid,
        eventType: TxType.MINT,
        items: params.items,
      },
      { correlationId: params.requestId },
    );
    if (!(gameServerData.status === 200 || gameServerData.status === 201)) {
      throw new GameApiException(
        'failed to respond on game server',
        '',
        GameApiHttpStatus.EXTERNAL_SERVER_ERROR,
      );
    }
    return gameServerData.body.data;
  }

  private errorHandler(error, payload, eventPattern: string) {
    // connection error
    if (this.ConnectionError.includes(error.code)) {
      // send msg to queue again
      const retryCount: number =
        payload.retryCount ??
        Number(this.configService.get('Q_MAX_RETRY_COUNT'));
      if (retryCount === 0) {
        this.logger.error('can not try any more [retryCount: 0]');
        throw error;
      } else {
        this.logger.error(`retry ${eventPattern.toLowerCase()} event (${retryCount})`);
        this.client.emit(eventPattern, {
          ...payload,
          retryCount: retryCount,
        });
        throw new QueueException(
          `retry ${eventPattern.toLowerCase()} event`,
          '',
          QueueHttpStatus.RETRY_EVENT,
        );
      }
    } else {
      throw error;
    }
  }
}
