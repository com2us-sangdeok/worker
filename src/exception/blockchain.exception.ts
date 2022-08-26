import { HttpException } from '@nestjs/common';

export class BlockchainException extends HttpException {
  constructor(message: any, error: any = '', statusCode: BlockchainStatus = 0) {
    super(HttpException.createBody(message, error, statusCode), statusCode);
  }
}

export enum BlockchainStatus {
  TRANSACTION_FAILED = 900,
  INVALID_ADDRESS = 901,
  BROADCASTING_FAILED
}
