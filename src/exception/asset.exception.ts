import { HttpException } from '@nestjs/common';

export class AssetException extends HttpException {
  constructor(message: any, error: any, statusCode: AssetHttpStatus) {
    super(HttpException.createBody(message, error, statusCode), statusCode);
  }
}

export enum AssetHttpStatus {
  IMAGE_UPLOAD_FAILED = 980,
  IMAGE_URL_UPLOAD_FAILED = 981,
}