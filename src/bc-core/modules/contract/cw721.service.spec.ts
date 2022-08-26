import { Test, TestingModule } from '@nestjs/testing';
import {
  Fee,
  LCDClient,
  MnemonicKey,
  MsgSend,
  Wallet,
  Coins,
} from '@terra-money/terra.js';
import { BlockchainClient } from '@blockchain/chain-bridge';
import { BlockchainService } from '../../blockchain/blockchain.service';
import { coreProviders } from '../../core.provider';
import { BlockchainModule } from '../../blockchain/blockchain.module';
import { CommonService } from '../common.service';
import { CW721Service } from './cw721.service';

describe('cw721Service', () => {
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

  const nftContract = 'terra1sshdl5qajv0q0k6shlk8m9sd4lplpn6gggfr86';

  const randNum = Math.floor(Math.random() * 100000);

  let walletService: BlockchainService;
  let commonService: CommonService;
  let cw721Service: CW721Service;

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
        CW721Service,
      ],
      exports: [],
    }).compile();

    walletService = app.get<BlockchainService>(BlockchainService);
    commonService = app.get<CommonService>(CommonService);
    cw721Service = app.get<CW721Service>(CW721Service);

    lcd = walletService.lcdClient();
    bc = walletService.blockChainClient();
  });

  describe('cw721 nft conftact test', () => {
    it('mint', async () => {
      jest.setTimeout(10000);
      const attributes = [
        {
          trait_type: 'name',
          value: 'minho',
        },
      ];

      try {
        const mintMsg = await cw721Service.mint(
          sender.address,
          nftContract,
          receiver.address,
          randNum.toString(),
          `${randNum}_test_uri1`,
          {
            image: 'Asdasd',
            attributes: attributes,
          },
        );

        const unsignedTx = await lcd.tx.create([{ address: sender.address }], {
          msgs: [mintMsg],
        });

        const ownerWallet = bc.client.wallet(sender.mnemonic);
        const signedTx = await commonService.sign(ownerWallet, unsignedTx);
        const hash = await lcd.tx.broadcast(signedTx);
        expect(hash).not.toBeNull();
        console.log('mint', hash);
      } catch (err) {
        console.log(err);
      }
    });

    it('nft Detail', async () => {
      const nftDetail = await cw721Service.nftDetail(
        nftContract,
        // randNum.toString(),
        '1',
      );
      expect(nftDetail).not.toBeNull();
      console.log('nft Detail', nftDetail);
    });

    it('nft List', async () => {
      const nftList = await cw721Service.nftList(nftContract, sender.address);
      expect(nftList).not.toBeNull();
      console.log('nft List', nftList);
    });

    // address -> address
    it('tranfer nft', async () => {
      const transferMsg = await cw721Service.transferToken(
        nftContract,
        sender.address,
        receiver.address,
        '123',
      );

      const unSignedTx = await lcd.tx.create([{ address: sender.address }], {
        msgs: [transferMsg],
      });

      const senderWallet = bc.client.wallet(sender.mnemonic);

      const signedTx = await commonService.sign(senderWallet, unSignedTx);
      const hash = await lcd.tx.broadcast(signedTx);
      expect(hash).not.toBeNull();
      console.log('signedTx', hash);
    });
  });
});
