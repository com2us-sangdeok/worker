import { GameApiException, GameApiHttpStatus } from './request.exception';

export class ExternalServerException extends GameApiException {
  constructor(message: any, error = 'External server call failed') {
    super(message, error, GameApiHttpStatus.INTERNAL_SERVER_ERROR);
  }
}