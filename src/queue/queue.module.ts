import { Module } from '@nestjs/common';
import {ClientsModule, ClientsProviderAsyncOptions, Transport} from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MintLogEntity, TransactionEntity } from '../entities';
import { WorkerController } from './worker/worker.controller';
import { WorkerService } from './worker/worker.service';
import { AxiosClientUtil } from '../util/axios-client.util';
import { QueueRepository } from './repository/queue.repository';
import { DeadLettersController } from './dead-letters/dead-letters.controller';
import { QueueModuleOption } from '../enum/queue.enum';
import { DeadLettersService } from './dead-letters/dead-letters.service';
import { RecoveryController } from './recovery/recovery.controller';
import { RecoveryService } from './recovery/recovery.service';
import {EventErrorEntity} from "../entities/event-error.entity";

const cs = new ConfigService();
let defaultProviders = [AxiosClientUtil, QueueRepository];

function moduleOptions(moduleOpt: QueueModuleOption) {
  let queueType: string = process.env.APP_NAME;
  switch (queueType) {
    case 'WORKER':
      return moduleOpt === QueueModuleOption.CONTROLLER
        ? [WorkerController]
        : [WorkerService, ...defaultProviders];
      break;
    case 'RECOVERY':
      return moduleOpt === QueueModuleOption.CONTROLLER
        ? [RecoveryController]
        : [RecoveryService, ...defaultProviders];
      break;
    case 'DEAD-LETTERS':
      return moduleOpt === QueueModuleOption.CONTROLLER
        ? [DeadLettersController]
        : [DeadLettersService, ...defaultProviders];
      break;
  }
}

@Module({
  imports: [
    ClientsModule.registerAsync([
      // clientModuleOptions()
      {
        name: 'WORKER',
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            queue: configService.get('Q_WORKER_NAME'),
            noAck: false,
            urls: [
              `amqp://${cs.get('Q_USER')}:${cs.get('Q_PASSWORD')}@${cs.get(
                  'Q_HOST',
              )}:${cs.get('Q_PORT')}`,
            ],
            prefetchCount: 1,
            persistent: true,
            queueOptions: {
              deadLetterExchange: '',
              deadLetterRoutingKey: configService.get('Q_DEAD-LETTER_NAME'),
              messageTtl: Number(configService.get('Q_MSG_TTL')),
              durable: true,
            },
          },
        }),
        inject: [ConfigService],
      },
      {
        name: 'DEAD-LETTERS',
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            queue: configService.get('Q_DEAD-LETTER_NAME'),
            noAck: false,
            urls: [
              `amqp://${cs.get('Q_USER')}:${cs.get('Q_PASSWORD')}@${cs.get(
                  'Q_HOST',
              )}:${cs.get('Q_PORT')}`,
            ],
            prefetchCount: 1,
            persistent: true,
            queueOptions: {
              durable: true,
            },
          },
        }),
        inject: [ConfigService],
      }
    ]),
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        timeout: configService.get('HTTP_TIMEOUT'),
        // maxRedirects: configService.get('HTTP_MAX_REDIRECTS'),
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([MintLogEntity, TransactionEntity, EventErrorEntity]),
  ],
  controllers: moduleOptions(QueueModuleOption.CONTROLLER),
  providers: moduleOptions(QueueModuleOption.PROVIDERS),
})
export class QueueModule {}
