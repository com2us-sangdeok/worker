import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import {queueOptions} from './queue';

let logger: LoggerService;
const cs = new ConfigService();

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule,
      queueOptions(cs)
  );
  logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(logger);

  app.listen();
}

bootstrap()
  .then(() => {
    logger.log(`${process.env.APP_NAME} is listening`);
  })
  .catch((e) => logger.error(`${process.env.APP_NAME} is crashed, ${e}`));
