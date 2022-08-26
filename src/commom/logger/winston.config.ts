import * as logform from 'logform';
import * as winston from 'winston';
import * as winstonDaily from 'winston-daily-rotate-file';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston/dist/winston.utilities';
import { ConfigService } from '@nestjs/config';

const ecsFormat = require('@elastic/ecs-winston-format');
const { colorize } = winston.format;

export function getLogFormat(nodeEnv: string): logform.Format {
  let format;
  switch (nodeEnv) {
    case 'local':
      format = winston.format.combine(
        winston.format.timestamp(),
        winston.format.ms(),
        colorize({ all: true }),
        nestWinstonModuleUtilities.format.nestLike(process.env.APP_NAME, {
          prettyPrint: true,
        }),
      );
      break;
    default:
      format = winston.format.combine(
        winston.format.timestamp(),
        ecsFormat({ convertReqRes: true }),
      );
      break;
  }
  return format;
}

const dailyOptions = (configService: ConfigService, level: string) => {
  return {
    level: level,
    datePattern: 'YYYY-MM-DD',
    dirname: `${process.cwd()}/${configService.get('LOG_PATH')}/${level}`,
    filename: `%DATE%.${level}.log`,
    maxFiles: configService.get('LOG_MAX_FILE'),
    zippedArchive: true,
  };
};

export const typeOrmTransports = (
  nodeEnv: string,
  configService: ConfigService,
) => {
  return [
    new winston.transports.Console({
      handleExceptions: true,
      level: logLevel(nodeEnv),
      // format: getLogFormat(nodeEnv)
    }),

    new winstonDaily(dailyOptions(configService, 'info')),
    new winstonDaily(dailyOptions(configService, 'warn')),
    new winstonDaily(dailyOptions(configService, 'error')),
  ];
};

export const logLevel = (nodeEnv: string) => {
  return nodeEnv === 'prod' ? 'info' : 'silly';
};
