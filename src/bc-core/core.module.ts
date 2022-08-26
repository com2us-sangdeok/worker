import { Module } from '@nestjs/common';
import { coreProviders } from './core.provider';
import { BlockchainModule } from './blockchain/blockchain.module';

import { CommonService } from './modules/common.service';
import { GrantService } from './modules/grant.service';
import { BlockchainService } from './blockchain/blockchain.service';
import { LockService } from './modules/contract/lock.service';
import { CW20Service } from './modules/contract/cw20.service';
import { CW721Service } from './modules/contract/cw721.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionEntity, SequenceEntity } from '../entities';
import {SequenceRepository} from "../queue/repository/sequence.repository";

const entityLsit = [TransactionEntity, SequenceEntity];

@Module({
  imports: [TypeOrmModule.forFeature(entityLsit), BlockchainModule],
  controllers: [],
  providers: [
    ...coreProviders,
    BlockchainService,
    CommonService,
    GrantService,
    LockService,
    CW20Service,
    CW721Service,
    SequenceRepository,
  ],
  exports: [
    BlockchainService,
    CommonService,
    GrantService,
    LockService,
    CW20Service,
    CW721Service,
  ],
})
export class BcCoreModule {}
