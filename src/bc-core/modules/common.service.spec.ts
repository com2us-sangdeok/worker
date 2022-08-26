import { Test, TestingModule } from '@nestjs/testing';
import { LCDClient, MnemonicKey, MsgSend, Wallet } from '@terra-money/terra.js';
import { BlockchainClient } from '@blockchain/chain-bridge';
import { BlockchainService } from '../blockchain/blockchain.service';
import { coreProviders } from '../core.provider';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { CommonService } from './common.service';
import { RabbitMQModule } from '../../commom/rabbit-mq/rabbit-mq.module';
import { RabbitMQService } from '../../commom/rabbit-mq/rabbit-mq.service';

describe('CommonService', () => {
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
  let rabbitMQService: RabbitMQService;
  let lcd: LCDClient;
  let bc: BlockchainClient;

  beforeEach(async () => {
    process.env.BC_TYPE = 'terra';
    process.env.BC_NODE_URL = 'http://34.146.148.127:1317';
    process.env.BC_CHAIN_ID = 'localterra';
    process.env.Q_URL = 'wsl-localhost:5672';
    process.env.Q_USER = 'minho';
    process.env.Q_PASSWORD = 'alsgh!23';

    const app: TestingModule = await Test.createTestingModule({
      imports: [BlockchainModule, RabbitMQModule],
      controllers: [],
      providers: [
        ...coreProviders,
        BlockchainService,
        CommonService,
        // RabbitMQService,
      ],
      exports: [],
    }).compile();

    walletService = app.get<BlockchainService>(BlockchainService);
    commonService = app.get<CommonService>(CommonService);
    rabbitMQService = app.get<RabbitMQService>(RabbitMQService);
    lcd = walletService.lcdClient();
    bc = walletService.blockChainClient();
  });

  //lock
  describe('common', () => {
    it('get Balance coin', async () => {
      const balance = await commonService.getBalance(sender.address);

      expect(balance).not.toBeNull();
      console.log('balance', balance);
    });

    it('transfer coin', async () => {
      const msg = await commonService.transferCoin(
        sender.address,
        receiver.address,
        '100000000',
        'uluna',
      );

      const createTx = await lcd.tx.create([{ address: sender.address }], {
        msgs: [msg],
      });
      //
      const wallet: Wallet = lcd.wallet(
        new MnemonicKey({ mnemonic: sender.mnemonic }),
      );
      const signedTx = await commonService.sign(wallet, createTx);
      const result = await rabbitMQService.send('asdasdasdasdasd', signedTx);
      // const hash = await commonService.broadCast(signedTx);
      // const hash = await lcd.tx.broadcastSync(signedTx);
      expect(result).not.toBeNull();

      console.log(result);
    });
  });
});
