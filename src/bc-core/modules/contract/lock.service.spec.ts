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
import { GrantService } from '../grant.service';
import { LockService } from './lock.service';
import { BlockchainService } from '../../blockchain/blockchain.service';
import { coreProviders } from '../../core.provider';
import { BlockchainModule } from '../../blockchain/blockchain.module';
import { CommonService } from '../common.service';
import { CW721Service } from './cw721.service';

describe('LockService', () => {
  const sender = {
    address: 'terra1x46rqay4d3cssq8gxxvqz8xt6nwlz4td20k38v',
    mnemonic:
      'notice oak worry limit wrap speak medal online prefer cluster roof addict wrist behave treat actual wasp year salad speed social layer crew genius',
  };

  const granter = {
    address: 'terra1757tkx08n0cqrw7p86ny9lnxsqeth0wgp0em95',
    mnemonic:
      'symbol force gallery make bulk round subway violin worry mixture penalty kingdom boring survey tool fringe patrol sausage hard admit remember broken alien absorb',
  };

  const contractOwner = {
    address: 'terra1x46rqay4d3cssq8gxxvqz8xt6nwlz4td20k38v',
    mnemonic:
      'notice oak worry limit wrap speak medal online prefer cluster roof addict wrist behave treat actual wasp year salad speed social layer crew genius',
  };

  const lockContract = 'terra1wgh6adn8geywx0v78zs9azrqtqdegufuegnwep';
  const nftContract = 'terra1sshdl5qajv0q0k6shlk8m9sd4lplpn6gggfr86';

  let grantService: GrantService;
  let lockService: LockService;
  let walletService: BlockchainService;
  let lcd: LCDClient;
  let bc: BlockchainClient;
  const tokenId = '1';
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
        GrantService,
        LockService,
        CommonService,
        CW721Service,
      ],
      exports: [],
    }).compile();

    grantService = app.get<GrantService>(GrantService);
    lockService = app.get<LockService>(LockService);
    walletService = app.get<BlockchainService>(BlockchainService);
    lcd = walletService.lcdClient();
    bc = walletService.blockChainClient();
  });

  //lock
  describe('call Lock', () => {
    let nftList = [];
    let lockMsg;
    let simulFee;
    let tx: Tx;
    let senderWallet;
    let senderWalletInfo;
    let signedTx: Tx;

    it('before lock nft List', async () => {
      nftList = await lockService.lockNftList(lockContract, sender.address);
      expect(nftList).not.toBeNull();
      console.log('before nftList', nftList);
    });

    it('create lock msg', async () => {
      lockMsg = await lockService.lock(
        sender.address,
        lockContract,
        nftContract,
        tokenId,
      );

      expect(lockMsg).not.toBeNull();
      console.log('lockMsg', lockMsg);
    });

    it('get simulFee', async () => {
      simulFee = await grantService.simulFee(
        [lockMsg],
        [contractOwner.address],
      );

      expect(simulFee).not.toBeNull();
      console.log('simulFee', simulFee);
    });

    it('create unSigned tx', async () => {
      tx = await lcd.tx.create([], {
        msgs: [lockMsg],
        fee: simulFee,
      });
      expect(tx).not.toBeNull();
      console.log('unSignedTx', tx);
    });

    it('to sign tx', async () => {
      senderWallet = lcd.wallet(new MnemonicKey({ mnemonic: sender.mnemonic }));
      senderWalletInfo = await senderWallet.accountNumberAndSequence();

      //sender sign
      tx = await senderWallet.key.signTx(tx, {
        chainID: lcd.config.chainID,
        signMode: 127,
        sequence: senderWalletInfo.sequence,
        accountNumber: senderWalletInfo.account_number,
      });

      //granter sign
      signedTx = await grantService.grantSign(tx);
      expect(signedTx).not.toBeNull();
      console.log('signedTx', signedTx);
    });

    it('lock broadCast', async () => {
      const hash = await lcd.tx.broadcast(signedTx);
      expect(hash).not.toBeNull();
      console.log(hash);
    });

    it('after lock nft List', async () => {
      const list = await lockService.lockNftList(lockContract, sender.address);
      expect(list).not.toBe(nftList);
      console.log('after nftList', list);
    });
  });

  //unLock
  describe('call unLock', () => {
    let lockNftList = [];
    let unlockMsg;
    let simulFee;
    let tx: Tx;
    let ownerWallet;
    let ownerWalletInfo;
    let signedTx: Tx;

    it('before lock nft List', async () => {
      lockNftList = await lockService.lockNftList(lockContract, sender.address);
      expect(lockNftList).not.toBeNull();
      console.log('before nftList', lockNftList);
    });

    it('create unlock msg', async () => {
      unlockMsg = await lockService.unLock(lockContract, nftContract, tokenId);
      expect(unlockMsg).not.toBeNull();
      console.log('unlockMsg', unlockMsg);
    });

    //대납 한다면
    it('get simulFee', async () => {
      simulFee = await grantService.simulFee(
        [unlockMsg],
        [contractOwner.address],
      );

      expect(simulFee).not.toBeNull();
      console.log('simulFee', simulFee);
    });

    it('create unSigned tx', async () => {
      tx = await lcd.tx.create([], { msgs: [unlockMsg], fee: simulFee });

      expect(tx).not.toBeNull();
      console.log('unSignedTx', tx);
    });

    it('to sign tx', async () => {
      // lock contract owner sign
      signedTx = await lockService.unLockSign(tx, contractOwner.address);
      //granter sign => 대납이 필요하다면
      signedTx = await grantService.grantSign(signedTx);
      expect(signedTx).not.toBeNull();
      console.log('signedTx', signedTx);
    });

    it('unlock broadCast', async () => {
      const hash = await lcd.tx.broadcast(signedTx);
      expect(hash).not.toBeNull();
      console.log(hash);
    });

    it('after lock nft List', async () => {
      const list = await lockService.lockNftList(lockContract, sender.address);
      expect(list).not.toBe(lockNftList);
      console.log('after nftList', list);
    });
  });
});
