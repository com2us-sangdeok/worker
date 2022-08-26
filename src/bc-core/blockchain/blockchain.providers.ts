import {
  BlockchainClient,
  BlockchainClientOptions,
} from '@blockchain/chain-bridge';
import { ConfigModule, ConfigService } from '@nestjs/config';

export const blockchainProviders = [
  {
    provide: 'CHAIN_SOURCE',
    import: [ConfigModule],
    useFactory: async (configService: ConfigService) => {
      const options: BlockchainClientOptions = {
        type: configService.get('BC_TYPE'),
        nodeURL: configService.get('BC_NODE_URL'),
        chainID: configService.get('BC_CHAIN_ID'),
        isClassic: true,
      };

      return new BlockchainClient(options);
    },
    inject: [ConfigService],
  },
];
