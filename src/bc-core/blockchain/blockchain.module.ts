import { Module } from '@nestjs/common';
import { blockchainProviders } from './blockchain.providers';
import { ConfigService } from '@nestjs/config';
import { BlockchainService } from './blockchain.service';

@Module({
  imports: [],
  providers: [...blockchainProviders, ConfigService],
  exports: [...blockchainProviders],
})
export class BlockchainModule {}
