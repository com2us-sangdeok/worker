import { Test, TestingModule } from '@nestjs/testing';
import {
  Fee,
  LCDClient,
  MnemonicKey,
  MsgSend,
  Wallet,
  Coins,
} from '@terra-money/terra.js';
import { Msg, Tx } from '@terra-money/terra.js/dist/core';
import { Pagination } from '@terra-money/terra.js/dist/client/lcd/APIRequester';
import { BlockchainClient } from '@blockchain/chain-bridge';
import { GrantService } from './grant.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { coreProviders } from '../core.provider';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { CommonService } from './common.service';
import { RabbitMQModule } from '../../commom/rabbit-mq/rabbit-mq.module';
import { RabbitMQService } from '../../commom/rabbit-mq/rabbit-mq.service';

describe('GrantService', () => {
  const sender = {
    address: 'terra14vqqls4t0np2g92lh0h92934ntwk0gaxqhn7wc',
    mnemonic:
      'salute actor hen river distance bus scissors bike blush return purity laugh remind rough magic work drum able car embrace rather credit blue add',
  };

  const receiver = {
    address: 'terra1dpau8af8qu3cpturacqu26uwnn2wagfqgu3c4p',
    mnemonic:
      'course patient raw vapor evoke survey together math decorate mango use fence abuse column coach tree fine wedding mixture educate acquire inject script milk',
  };

  const granter = {
    address: 'terra1757tkx08n0cqrw7p86ny9lnxsqeth0wgp0em95',
    mnemonic:
      'symbol force gallery make bulk round subway violin worry mixture penalty kingdom boring survey tool fringe patrol sausage hard admit remember broken alien absorb',
  };
  let grantService: GrantService;
  let walletService: BlockchainService;
  let commonService: CommonService;
  let rabbitMQService: RabbitMQService;

  let lcd: LCDClient;
  let bc: BlockchainClient;
  beforeEach(async () => {
    process.env.BC_TYPE = 'terra';
    process.env.BC_NODE_URL = 'http://34.146.148.127:1317';
    process.env.BC_CHAIN_ID = 'localterra';

    const app: TestingModule = await Test.createTestingModule({
      imports: [BlockchainModule, RabbitMQModule],
      controllers: [],
      providers: [
        ...coreProviders,
        GrantService,
        BlockchainService,
        CommonService,
      ],
      exports: [],
    }).compile();

    grantService = app.get<GrantService>(GrantService);
    walletService = app.get<BlockchainService>(BlockchainService);
    commonService = app.get<CommonService>(CommonService);
    rabbitMQService = app.get<RabbitMQService>(RabbitMQService);
    lcd = walletService.lcdClient();
    bc = walletService.blockChainClient();
  });

  describe('transfer coin with granter', () => {
    let senderWallet: Wallet;
    let senderWalletInfo;
    let tx: Tx;
    let simulFee: Fee;
    let msg: Msg;

    let senderBalance: [Coins, Pagination];
    let receiverBalance: [Coins, Pagination];
    let granterBalance: [Coins, Pagination];

    let senderLuna;
    let receiverLuna;
    let granterUusd;
    let signedTx: Tx;

    it('before : check balance', async () => {
      senderBalance = await lcd.bank.balance(sender.address);
      receiverBalance = await lcd.bank.balance(receiver.address);
      granterBalance = await lcd.bank.balance(granter.address);

      senderLuna = {
        denom: senderBalance[0].get('uluna').denom,
        amount: senderBalance[0].get('uluna').amount,
      };
      receiverLuna = {
        denom: receiverBalance[0].get('uluna').denom,
        amount: receiverBalance[0].get('uluna').amount,
      };
      granterUusd = {
        denom: granterBalance[0].get('uusd').denom,
        amount: granterBalance[0].get('uusd').amount,
      };

      console.log('sender', senderLuna.amount + senderLuna.denom);
      console.log('receiverBalance', receiverLuna.amount + receiverLuna.denom);
      console.log('granterBalance', granterUusd.amount, granterUusd.denom);
    });

    it('cal simulFee', async () => {
      msg = await new MsgSend(
        sender.address,
        receiver.address,
        '100000000uluna',
      );

      //msg 수수료 계산
      simulFee = await grantService.simulFee([msg], [sender.address]);

      expect(simulFee).not.toBeNull();
      console.log('simulFee', simulFee);
    });

    it('create unSigned Tx', async () => {
      // sign 빈 tx 생성

      //signers 값 필수!! => 하지만 대납일대 fee변수에 해당 정보가 있어서 signers값 필수 아님
      tx = await lcd.tx.create([], { msgs: [msg], fee: simulFee });

      expect(tx).not.toBeNull();
      console.log('empty Tx', tx);
    });

    it('create signedTx', async () => {
      senderWallet = lcd.wallet(new MnemonicKey({ mnemonic: sender.mnemonic }));
      senderWalletInfo = await senderWallet.accountNumberAndSequence();

      //sender sign
      tx = await commonService.sign(senderWallet, tx);

      //granter sign
      // signedTx = await grantService.grantSign(tx);
      // const result = rabbitMQService.send(tx);
      expect(tx).not.toBeNull();
      console.log('tx', tx);
    });

    // it('broadCast', async () => {
    //   const hash = await lcd.tx.broadcast(signedTx);
    //   expect(hash).not.toBeNull();
    //   console.log(hash);
    // });

    // it('saveQueue', async () => {
    //   const result = rabbitMQService.send(tx);
    //   expect(result).not.toBeNull();
    //   console.log(result);
    // });

    it('after : check balance', async () => {
      const senderBalance1 = await lcd.bank.balance(sender.address);
      const receiverBalance1 = await lcd.bank.balance(receiver.address);
      const granterBalance1 = await lcd.bank.balance(granter.address);

      const senderLuna1 = {
        denom: senderBalance1[0].get('uluna').denom,
        amount: senderBalance1[0].get('uluna').amount,
      };
      const receiverLuna1 = {
        denom: receiverBalance1[0].get('uluna').denom,
        amount: receiverBalance1[0].get('uluna').amount,
      };
      const granterUusd1 = {
        denom: granterBalance1[0].get('uusd').denom,
        amount: granterBalance1[0].get('uusd').amount,
      };

      expect(senderLuna.amount).not.toBe(senderLuna1.amount);
      expect(senderLuna.amount).not.toBe(receiverLuna1.amount);
      expect(granterUusd.amount).not.toBe(granterUusd1.amount);

      console.log('sender', senderLuna.amount + senderLuna.denom);
      console.log('receiverBalance', receiverLuna.amount + receiverLuna.denom);
      console.log('granterBalance', granterUusd.amount, granterUusd.denom);
    });
  });
});
