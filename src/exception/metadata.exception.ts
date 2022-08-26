import { HttpException } from '@nestjs/common';

export class MetadataException extends HttpException {
  constructor(message: any, error: any, statusCode: MetadataHttpStatus) {
    super(HttpException.createBody(message, error, statusCode), statusCode);
  }
}

export enum MetadataHttpStatus {
  METADATA_UPLOAD_FAILED = 990,
  SEARCHING_FAILED
}