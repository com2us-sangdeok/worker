import {ServerException} from "./server.exception";

export class MintException extends ServerException {
  constructor(message: any, error: any, statusCode: MintHttpStatus) {
    super(ServerException.createBody(message, error, statusCode), statusCode);
  }
}

export enum MintHttpStatus {
  VALIDATION_FAILED = 4000,
  MINTING_FAILED,
  INVALID_MINTING_FEE,
  ITEM_NOT_FOUND,
  BURN_FAILED,
  NFT_EXISTED,
  NFT_NOT_EXISTED,
  NOT_ENOUGH_TOKEN
}