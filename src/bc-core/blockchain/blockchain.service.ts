import { Inject, Injectable } from '@nestjs/common';
import { Fee, LCDClient, MnemonicKey } from '@terra-money/terra.js';
import { Msg, Tx } from '@terra-money/terra.js/dist/core';
import { SignMode } from '@terra-money/terra.proto/cosmos/tx/signing/v1beta1/signing';
import {
  BlockchainClient,
  BlockchainClientOptions,
} from '@blockchain/chain-bridge';
import { ConfigService } from '@nestjs/config';

// tx 생성 수수료 대납
@Injectable()
export class BlockchainService {
  constructor(
    @Inject('BLOCKCHAIN_CLIENT')
    private bc: BlockchainClient,
  ) {}

  public lcdClient(): LCDClient {
    return this.bc.client.getLcdClient();
  }

  public blockChainClient(): BlockchainClient {
    return this.bc;
  }
}
