import { HttpException } from '@nestjs/common';

export class MintException extends HttpException {
  constructor(message: any, error: any, statusCode: MintHttpStatus) {
    super(HttpException.createBody(message, error, statusCode), statusCode);
  }
}

export enum MintHttpStatus {
  VALIDATION_FAILED = 950,
  MINTING_FAILED,
  INVALID_MINTING_FEE,
  SEARCHING_FAILED
}