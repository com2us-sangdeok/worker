import { ServerException } from './server.exception';

export class GameApiException extends ServerException {
  constructor(message: any, error: any, statusCode: GameApiHttpStatus) {
    super(ServerException.createBody(message, error, statusCode), statusCode);
  }
}

export enum GameApiHttpStatus {
  OK = 1000,
  CREATED,
  BAD_REQUEST,
  NOT_FOUND,
  INTERNAL_SERVER_ERROR,
  EXTERNAL_SERVER_ERROR,
}
