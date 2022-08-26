import { Injectable } from '@nestjs/common';
import { BlockchainService } from '../../blockchain/blockchain.service';
import { Wallet, Tx, MsgExecuteContract } from '@terra-money/terra.js';
import { NftDetail } from '../modules.inerface';

@Injectable()
export class CW721Service {
  private bc = this.blockchainService.blockChainClient();

  constructor(private readonly blockchainService: BlockchainService) {}

  public async mint(
    nftContractOwner: string,
    nftContract: string,
    receiver: string,
    tokenId: string,
    tokenUri: string,
    extension: object,
  ): Promise<MsgExecuteContract> {
    //TODO extension 필수값 체크

    try {
      const executeMsg = {
        mint: {
          senderAddress: nftContractOwner,
          token_id: tokenId,
          owner: receiver,
          token_uri: tokenUri,
          extension: extension,
        },
      };

      return new MsgExecuteContract(
        nftContractOwner,
        nftContract,
        { ...executeMsg },
        {},
      );
    } catch (err) {
      console.log(err);
    }
  }

  // TODO 추가 예정
  public async burn(): Promise<any> {}

  //nft List 조회
  public async nftList(
    nftContract: string,
    address: string,
  ): Promise<string[]> {
    try {
      return await this.bc.client.contractQuery(nftContract, {
        tokens: { owner: address },
      });
    } catch (err) {
      console.log(err);
    }
  }

  //nft Detail 조회
  public async nftDetail(
    nftContract: string,
    tokenId: string,
  ): Promise<Partial<NftDetail>> {
    try {
      return await this.bc.client.contractQuery(nftContract, {
        nft_info: { token_id: tokenId },
      });
    } catch (err) {
      console.log(err);
    }
  }

  //token 전송 address->address
  public async transferToken(
    nftContract: string,
    sender: string,
    receiver: string,
    tokenId: string,
  ): Promise<MsgExecuteContract> {
    try {
      const executeMsg = {
        transfer_nft: {
          recipient: receiver,
          token_id: tokenId,
        },
      };

      return new MsgExecuteContract(sender, nftContract, { ...executeMsg }, {});
    } catch (err) {
      console.log(err);
    }
  }

  //token 전송 address->contract
  public async sendToken(
    nftContract: string,
    toContract: string,
    sender: string,
    tokenId: string,
    msg: string,
  ): Promise<MsgExecuteContract> {
    try {
      const executeMsg = {
        send_nft: {
          msg: msg,
          //to contract
          contract: toContract,
          token_id: tokenId,
        },
      };

      return new MsgExecuteContract(sender, nftContract, { ...executeMsg }, {});
    } catch (err) {
      console.log(err);
    }
  }
}
