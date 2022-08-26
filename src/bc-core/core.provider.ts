import { BlockchainClient } from '@blockchain/chain-bridge';

export const coreProviders = [
  {
    provide: 'BLOCKCHAIN_CLIENT',
    useFactory: (blockchainClient: BlockchainClient) => blockchainClient,
    inject: ['CHAIN_SOURCE'],
  },
];
