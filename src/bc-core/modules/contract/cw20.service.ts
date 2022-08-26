import { Injectable } from '@nestjs/common';
import { BlockchainService } from '../../blockchain/blockchain.service';
import { MsgExecuteContract } from '@terra-money/terra.js';
import { TokenBalance } from '../modules.inerface';

@Injectable()
export class CW20Service {
  private bc = this.blockchainService.blockChainClient();

  constructor(private readonly blockchainService: BlockchainService) {}

  //token balance 조회
  public async tokenBalance(
    tokenContract: string,
    address: string,
  ): Promise<TokenBalance> {
    try {
      const contractInfo = await this.bc.client.contractQuery(tokenContract, {
        token_info: {},
      });
      const balance = await this.bc.client.contractQuery(tokenContract, {
        balance: { address: address },
      });
      return {
        balance: balance,
        decimals: contractInfo.decimals,
        tokenName: contractInfo.name,
        tokenSymbol: contractInfo.symbol,
      };
    } catch (err) {
      console.log(err);
    }
  }

  //token 전송
  public async transferToken(
    tokenContract: string,
    sender: string,
    receiver: string,
    amount: string,
  ): Promise<MsgExecuteContract> {
    try {
      const executeMsg = {
        transfer: {
          recipient: receiver,
          amount: amount,
        },
      };

      return new MsgExecuteContract(
        sender,
        tokenContract,
        { ...executeMsg },
        {},
      );
    } catch (err) {
      console.log(err);
    }
  }
}
