import { Injectable } from '@nestjs/common';
import { Msg, Tx } from '@terra-money/terra.js/dist/core';
import { BlockchainService } from '../blockchain/blockchain.service';
import { CommonService } from './common.service';
import { Fee } from '@terra-money/terra.js';

// tx 생성 수수료 대납
@Injectable()
export class GrantService {
  private bc = this.blockchainService.blockChainClient();

  //TODO HSM교체 예정
  private granter = {
    address: 'terra1757tkx08n0cqrw7p86ny9lnxsqeth0wgp0em95',
    mnemonic:
      'symbol force gallery make bulk round subway violin worry mixture penalty kingdom boring survey tool fringe patrol sausage hard admit remember broken alien absorb',
  };

  constructor(
    private readonly blockchainService: BlockchainService,
    private readonly commonService: CommonService,
  ) {}

  public async simulFee(msgs: Msg[], signerList: string[]): Promise<Fee> {
    try {
      return await this.bc.client.getFee(
        msgs,
        this.granter.address,
        signerList,
      );
    } catch (err) {
      //TODO exception처리
      console.log(err);
    }
  }

  public async grantSign(tx: Tx): Promise<Tx> {
    try {
      // 대납자의 지갑주소로 sign 하기 위함
      const granterWallet = this.bc.client.wallet(this.granter.mnemonic);

      return await this.commonService.sign(granterWallet, tx);
    } catch (err) {
      //TODO exception처리
      console.log(err);
    }
  }
}
