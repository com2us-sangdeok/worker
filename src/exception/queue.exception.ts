import { HttpException } from '@nestjs/common';

export class QueueException extends HttpException {
  constructor(message: any, error: any, statusCode: QueueHttpStatus) {
    super(HttpException.createBody(message, error, statusCode), statusCode);
  }
}

export enum QueueHttpStatus {
  SENDING_MESSAGE_FAILED = 920,
  MINTING_PROCESS_FAILED,
  CONVERTING_PROCESS_FAILED,
  LOCKING_PROCESS_FAILED,
  UNLOCKING_PROCESS_FAILED,
  TRANSACTION_FAILED,
  RETRY_EVENT
}
