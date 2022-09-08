export const PATTERN_MINT = 'MINT';
export const PATTERN_CONVERT = 'CONVERT';
export const PATTERN_LOCK = 'LOCK';
export const PATTERN_UNLOCK = 'UNLOCK';
export const PATTERN_BURN = 'BURN';
export const PATTERN_TEST = 'TEST';

export interface DefaultPayload {
  requestId: string;
  result: string;
  txHash: string;
  gameIndex: string;
  appId?: string;
  pid: number;
  retryCount?: number;
}

export interface MintPayload extends DefaultPayload {
  tokenId: string;
}

export interface ConvertPayload extends DefaultPayload {
  convertType: string;
  inAmount: number;
  outAmount: number;
}

export interface LockPayload extends DefaultPayload {
  tokenId: string;
}

export interface UnlockPayload extends DefaultPayload {
  tokenId: string;
}

export interface BurnPayload extends DefaultPayload {
  tokenId: string;
}

export interface TestPayload {
  id: string;
}

/**
{
 "pattern": "MINT",
 "data": {
   "requestId":"471866fb-9511-410e-8dc4-0e4938cfd300",
   "txHash": "txHash",
   "gameIndex": "gameIndex",
   "appId": "com.com2us.testgame.global.normal",
   "pid": 11,
   "tokenId": "tokenId"
  }
}

{
 "pattern": "CONVERT",
 "data": {
   "requestId":"John",
   "txHash": "txHash",
   "gameIndex": "gameIndex",
   "pid": "pid",
   "tokenId": "tokenId"
  }
}

 {
 "pattern": "TEST",
 "data": {
   "id":"GAME-API-68b549a8-9edc-43fa-8d4b-1e57f5c134bd",
   "txHash": "txHash",
   "gameIndex": "gameIndex",
   "pid": "pid",
   "tokenId": "tokenId"
  }
}
 */