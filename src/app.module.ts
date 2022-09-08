import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule, TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BcCoreModule } from './bc-core/core.module';
import { WinstonModule } from 'nest-winston';
import {
  getLogFormat,
  typeOrmTransports,
} from './commom/logger/winston.config';
import { LoggerMiddleware } from './middleware/logger.middleware';
import DatabaseLogger from './commom/logger/database.logger';
import { RequestContextMiddleware } from './middleware/request-context.middleware';
import {
  ConvertPoolEntity,
  MintLogEntity,
  TransactionEntity,
} from './entities';
import {QueueModule} from "./queue/queue.module";
import {EventErrorEntity} from "./entities/event-error.entity";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `${process.cwd()}/.env.${process.env.NODE_ENV}`,
    }),
    TerminusModule,
    HttpModule,
    WinstonModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        format: getLogFormat(process.env.NODE_ENV),
        transports: typeOrmTransports(process.env.NODE_ENV, configService),
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: async (configService: ConfigService) => {
        return {
          type: configService.get('DB_TYPE'),
          host: configService.get('DB_HOST'),
          port: configService.get('DB_PORT'),
          username: configService.get('DB_USERNAME'),
          password: configService.get('DB_PASSWORD'),
          database: configService.get('DB_DATABASE'),
          entities: [
            ConvertPoolEntity,
            MintLogEntity,
            TransactionEntity,,
            EventErrorEntity,
          ],
          synchronize: configService.get('DB_SYNCHRONIZE') === 'true',
          logging: true,
          logger: new DatabaseLogger(process.env.NODE_ENV),
        } as TypeOrmModuleAsyncOptions;
      },
      inject: [ConfigService],
    }),
    BcCoreModule,
    QueueModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestContextMiddleware, LoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
