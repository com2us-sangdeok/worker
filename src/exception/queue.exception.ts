import { HttpException } from '@nestjs/common';

export class QueueException extends HttpException {
  constructor(message: any, error: any, statusCode: QueueHttpStatus) {
    super(HttpException.createBody(message, error, statusCode), statusCode);
  }
}

export enum QueueHttpStatus {
  EMIT_FAILED = 920,
  MINT_FAILED,
  CONVERT_FAILED,
  LOCK_FAILED,
  UNLOCK_FAILED,
  TRANSACTION_FAILED,
  RETRY_EVENT
}
