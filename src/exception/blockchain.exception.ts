import { HttpException } from '@nestjs/common';

export class BlockchainException extends HttpException {
  constructor(message: any, error: any = '', statusCode: BlockchainStatus = 0) {
    super(HttpException.createBody(message, error, statusCode), statusCode);
  }
}

export enum BlockchainStatus {
  TRANSACTION_FAILED = 9000,
  BROADCASTING_FAILED,
  INVALID_ADDRESS,
  CREATE_TX_ERROR,
  SIGN_ERROR,
  GET_COIN_BALANCE_ERROR,
  GET_TOKEN_BALANCE_ERROR,
  TRANSFER_COIN_ERROR,
  TRANSFER_TOKEN_ERROR,
  //nft
  NFT_MINT_ERROR,
  NFT_BURN_ERROR,
  GET_NFT_LIST_ERROR,
  GET_NFT_DETAIL_ERROR,
  NFT_TRANSFER_ERROR,
  //lock
  NFT_SEND_ERROR,
  NFT_LOCK_ERROR,
  NFT_UNLOCK_ERROR,
  NFT_INLOCK_SIGN_ERROR,
  NFT_LOCK_LIST_ERROR,

  //txcheck Error
  TX_CHECK_ERROR,

  //broadcast
  BROADCAST_ERROR = 9999,
}
