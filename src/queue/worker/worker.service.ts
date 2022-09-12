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
    try {
      const gameServerData = await this.callExternalService(
        'get',
        this.configService.get('BG_DETAIL_GAME_INFO').replace('{APP_ID}', payload.appId)
        );

      const mintLog = await this.workerRepository.getMintLogByRequestId(
        payload.requestId,
      );
      const serverInfo = mintLog.server;//mintLog.server.split(',');
      const characterId = ''
      const header = {
        appId: payload.appId,
        server: serverInfo,
        playerId: payload.pid,
      }

      // reply tx result to the game server
      const gameServerTxResultApi = gameServerData.apiLists.filter(
        (item) => item.apiTypeCd === GameServerApiCode.TX_RESULT,
      )[0];
      await this.callExternalService('post', 
        gameServerTxResultApi.apiUrl, 
        {requestId: payload.requestId,
          result: payload.result,
          eventType: TxType.MINT_ITEM,
          txHash: payload.txHash,
          characterId: characterId,
          requestedData: {tokenId: payload.tokenId}
        }, 
        header
      );

      await this.workerRepository.updateMintLogByRequestId(<MintLogEntity>{
        requestId: payload.requestId,
        status: MintLogStatus.COMPLETE,
      });
    } catch (error) {
      this.errorHandler(error, payload, PATTERN_MINT);
    }
  }

  async convertEvent(payload: ConvertPayload) {
    try {
      const gameServerData = await this.callExternalService(
        'get',
        this.configService.get('BG_DETAIL_GAME_INFO').replace('{APP_ID}', payload.appId)
        );
      const gameServerConvertApi = gameServerData.apiLists.filter(
          (item) => item.apiTypeCd === GameServerApiCode.CONVERT,
      )[0];

      const serverInfo = '';
      const characterId = '';
      const header = {
        appId: payload.appId,
        server: serverInfo,
        playerId: payload.pid,
      }

      // todo: convert type에 따른 처리
      //   db 조회 후 값 세팅
      // this.workerRepository
      // 보유재화 업데이트
      const goodsCode = '';
      const amount = '';
      const convertType = payload.convertType;
      if (payload.convertType === '') {
        const lockResult = await this.callExternalService('patch', 
          gameServerConvertApi.apiUrl, 
          {
            requestId: payload.requestId,
            characterId: characterId,
            goodsCode: goodsCode,
            amount: amount,
            type: convertType,
          }, 
          header
        );
      }
      
      // reply tx result to the game server
      const gameServerTxResultApi = gameServerData.apiLists.filter(
        (item) => item.apiTypeCd === GameServerApiCode.TX_RESULT,
      )[0];
      await this.callExternalService('post', 
        gameServerTxResultApi.apiUrl, 
        {requestId: payload.requestId,
          result: payload.result,
          eventType: convertType,
          txHash: payload.txHash,
          characterId: characterId,
          // fixme : convert data
          requestedData: ''
        }, 
        header
      );
    } catch (error) {
      this.errorHandler(error, payload, PATTERN_CONVERT);
    }
  }

  async lockEvent(payload: LockPayload) {
    try {
      this.logger.log(`payload: ${payload}`);
      const gameServerData = await this.callExternalService(
        'get',
        this.configService.get('BG_DETAIL_GAME_INFO').replace('{APP_ID}', payload.appId)
        );
      const gameServerLockApi = gameServerData.apiLists.filter(
          (item) => item.apiTypeCd === GameServerApiCode.LOCK_NFT,
      )[0];

      const serverInfo = '';
      const characterId = '';
      const header = {
        appId: payload.appId,
        server: serverInfo,
        playerId: payload.pid,
      }
      const lockResult = await this.callExternalService('patch', 
        gameServerLockApi.apiUrl, 
        {requestId: payload.requestId,
          characterId: characterId,
          tokenId: payload.tokenId
        }, 
        header
      );

      // reply tx result to the game server
      const gameServerTxResultApi = gameServerData.apiLists.filter(
        (item) => item.apiTypeCd === GameServerApiCode.TX_RESULT,
      )[0];
      await this.callExternalService('post', 
        gameServerTxResultApi.apiUrl, 
        {requestId: payload.requestId,
          result: payload.result,
          eventType: TxType.LOCK,
          txHash: payload.txHash,
          characterId: characterId,
          requestedData: {tokenId: payload.tokenId}
        }, 
        header
      );
    } catch (error) {
      this.errorHandler(error, payload, PATTERN_LOCK);
    }
  }

  async unlockEvent(payload: UnlockPayload) {
    this.logger.debug(`payload: ${payload}`);
    try {
      const gameServerData = await this.callExternalService(
        'get',
        this.configService.get('BG_DETAIL_GAME_INFO').replace('{APP_ID}', payload.appId)
        );
      const gameServerTxResultApi = gameServerData.apiLists.filter(
        (item) => item.apiTypeCd === GameServerApiCode.TX_RESULT,
      )[0];

      const serverInfo = '';
      const characterId = '';
      const replyTxResult = await this.callExternalService('post', 
        gameServerTxResultApi.apiUrl, 
        {requestId: payload.requestId,
          result: payload.result,
          eventType: TxType.UNLOCK,
          txHash: payload.txHash,
          characterId: characterId,
          requestedData: {tokenId: payload.tokenId}
        }, 
        {appId: payload.appId,
          server: serverInfo,
          playerId: payload.pid,
        }
      );
    } catch (error) {
      this.errorHandler(error, payload, PATTERN_UNLOCK);
    }
  }

  async burnEvent(payload: BurnPayload) {
    this.logger.debug(`payload: ${payload}`);
    try {
      const gameServerData = await this.callExternalService(
        'get',
        this.configService.get('BG_DETAIL_GAME_INFO').replace('{APP_ID}', payload.appId)
        );
      const gameServerTxResultApi = gameServerData.apiLists.filter(
        (item) => item.apiTypeCd === GameServerApiCode.TX_RESULT,
      )[0];

      const serverInfo = '';
      const characterId = '';
      const replyTxResult = await this.callExternalService('post', 
        gameServerTxResultApi.apiUrl, 
        {requestId: payload.requestId,
          result: payload.result,
          eventType: TxType.BURN,
          txHash: payload.txHash,
          characterId: characterId,
          requestedData: {tokenId: payload.tokenId}
        }, 
        {appId: payload.appId,
          server: serverInfo,
          playerId: payload.pid,
        }
      );
    } catch (error) {
      this.errorHandler(error, payload, PATTERN_BURN);
    }
  }

  private async lockSubEvent(payload: any) {
    
  };

  private async callExternalService(
    httpMethod: string,
    url: string,
    header?: any,
    body?: any,
  ): Promise<any> {
    let externalService;

    switch (httpMethod) {
      case 'get':
        externalService = await this.axiosClient.get(
          url
        );
        break;
      case 'post':
        externalService = await this.axiosClient.post(
          url,
          body,
          header
        );
        break;
      case 'patch':
        externalService = await this.axiosClient.patch(
          url,
          body,
          header
        );
        break;
      default:
        break;
    }
  
    if (!(externalService.status === 200 || externalService.status === 201)) {
      throw new GameApiException(
        'failed to respond on game server',
        '',
        GameApiHttpStatus.EXTERNAL_SERVER_ERROR,
      );
    }
    if (externalService.body.code === 404) {
      throw new GameApiException(
        'betagame not found',
        '',
        GameApiHttpStatus.EXTERNAL_SERVER_ERROR,
      );
    }
    return externalService.body.data;
  }

  // private async getBetaGameData(appId: string): Promise<any> {
  //   const betaGameData = await this.axiosClient.get(
  //     this.configService.get('BG_DETAIL_GAME_INFO').replace('{APP_ID}', appId),
  //   );
  //   if (betaGameData.status !== 200) {
  //     throw new GameApiException(
  //       'failed to respond on console server',
  //       '',
  //       GameApiHttpStatus.EXTERNAL_SERVER_ERROR,
  //     );
  //   }
  //   if (betaGameData.body.code === 404) {
  //     throw new GameApiException(
  //       'betagame not found',
  //       '',
  //       GameApiHttpStatus.EXTERNAL_SERVER_ERROR,
  //     );
  //   }
  //   return betaGameData.body.data;
  // }

  // private async replyTxResult(
  //   url: string,
  //   params: TxResultDto,
  // ): Promise<any> {
  //   const gameServerData = await this.axiosClient.post(
  //     url,
  //     {
  //       result: params.result,
  //       characterId: params.characterId,
  //       eventType: params.eventType,
  //       requestedData: params.data,
  //     },
  //     { appId: params.appId,
  //       server: params.server,
  //       playerId: params.playerId, },
  //   );
  //   if (!(gameServerData.status === 200 || gameServerData.status === 201)) {
  //     throw new GameApiException(
  //       'failed to respond on game server',
  //       '',
  //       GameApiHttpStatus.EXTERNAL_SERVER_ERROR,
  //     );
  //   }
  //   return gameServerData.body.data;
  // }

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
