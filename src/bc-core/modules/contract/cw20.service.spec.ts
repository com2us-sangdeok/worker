import { Test, TestingModule } from '@nestjs/testing';
import { LCDClient, MnemonicKey, Wallet } from '@terra-money/terra.js';
import { BlockchainClient } from '@blockchain/chain-bridge';
import { BlockchainService } from '../../blockchain/blockchain.service';
import { coreProviders } from '../../core.provider';
import { BlockchainModule } from '../../blockchain/blockchain.module';
import { CW20Service } from './cw20.service';
import { CommonService } from '../common.service';

describe('cw20 token', () => {
  const sender = {
    address: 'terra1x46rqay4d3cssq8gxxvqz8xt6nwlz4td20k38v',
    mnemonic:
      'notice oak worry limit wrap speak medal online prefer cluster roof addict wrist behave treat actual wasp year salad speed social layer crew genius',
  };

  const receiver = {
    address: 'terra1dpau8af8qu3cpturacqu26uwnn2wagfqgu3c4p',
    mnemonic:
      'course patient raw vapor evoke survey together math decorate mango use fence abuse column coach tree fine wedding mixture educate acquire inject script milk',
  };

  let walletService: BlockchainService;
  let commonService: CommonService;
  let cw20Service: CW20Service;
  let lcd: LCDClient;
  let bc: BlockchainClient;
  beforeEach(async () => {
    process.env.BC_TYPE = 'terra';
    process.env.BC_NODE_URL = 'http://34.146.148.127:1317';
    process.env.BC_CHAIN_ID = 'localterra';

    const app: TestingModule = await Test.createTestingModule({
      imports: [BlockchainModule],
      controllers: [],
      providers: [
        ...coreProviders,
        BlockchainService,
        CommonService,
        CW20Service,
      ],
      exports: [],
    }).compile();

    walletService = app.get<BlockchainService>(BlockchainService);
    commonService = app.get<CommonService>(CommonService);
    cw20Service = app.get<CW20Service>(CW20Service);
    lcd = walletService.lcdClient();
    bc = walletService.blockChainClient();
  });

  const cw20Contract = 'terra18vd8fpwxzck93qlwghaj6arh4p7c5n896xzem5';

  describe('cw20 contract', () => {
    it('get token balance', async () => {
      const balance = await cw20Service.tokenBalance(
        cw20Contract,
        sender.address,
      );

      expect(balance).not.toBeNull();
      console.log('balance', balance);
    });

    it('transfer token', async () => {
      const amount = '1000000';
      const msg = await cw20Service.transferToken(
        cw20Contract,
        sender.address,
        receiver.address,
        amount,
      );

      expect(msg).not.toBeNull();
      console.log('balance', msg);

      const createTx = await lcd.tx.create([{ address: sender.address }], {
        msgs: [msg],
      });

      const wallet: Wallet = lcd.wallet(
        new MnemonicKey({ mnemonic: sender.mnemonic }),
      );
      const signedTx = await commonService.sign(wallet, createTx);
      const hash = await lcd.tx.broadcast(signedTx);
      expect(hash).not.toBeNull();
      console.log(hash);
    });
  });
});
