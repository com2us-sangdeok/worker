import { ClientProviderOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

export function worker(cs: ConfigService): ClientProviderOptions {
  return <ClientProviderOptions>{
    transport: Transport.RMQ,
    name: 'WORKER',
    options: {
      urls: [
        `amqp://${cs.get('Q_USER')}:${cs.get('Q_PASSWORD')}@${cs.get(
          'Q_HOST',
        )}:${cs.get('Q_PORT')}`,
      ],
      queue: cs.get('Q_WORKER_NAME'),
      noAck: false,
      prefetchCount: 1,
      queueOptions: {
        deadLetterExchange: '',
        deadLetterRoutingKey: cs.get('Q_DEAD-LETTER_NAME'),
        // set message time to live to sec.
        messageTtl: Number(cs.get('Q_MSG_TTL')),
        durable: true,
        // delay: 10000,
      },
      persistent: true,
    },
  };
}

export function recovery(cs: ConfigService): ClientProviderOptions {
  return <ClientProviderOptions>{
    transport: Transport.RMQ,
    name: 'RECOVERY',
    options: {
      urls: [
        `amqp://${cs.get('Q_USER')}:${cs.get('Q_PASSWORD')}@${cs.get(
          'Q_HOST',
        )}:${cs.get('Q_PORT')}`,
      ],
      queue: cs.get('Q_RECOVERY_NAME'),
      noAck: false,
      prefetchCount: 1,
      queueOptions: {
        durable: true,
      },
      persistent: true,
    },
  };
}

export function deadLetters(cs: ConfigService): ClientProviderOptions {
  return <ClientProviderOptions>{
    transport: Transport.RMQ,
    name: 'DEAD-LETTERS',
    options: {
      urls: [
        `amqp://${cs.get('Q_USER')}:${cs.get('Q_PASSWORD')}@${cs.get(
          'Q_HOST',
        )}:${cs.get('Q_PORT')}`,
      ],
      queue: cs.get('Q_DEAD-LETTER_NAME'),
      noAck: false,
      prefetchCount: 1,
      queueOptions: {
        durable: true,
        // delay: 10000,
      },
      // todo: persistent 필요?, disk I/O 발생
      //  이미 db에 관련 tx를 저장하고 있으므로 기능 활설화 여부 검토
      persistent: true,
    },
  };
}

export const queueOptions = (cs: ConfigService): ClientProviderOptions => {
  const type: string = process.env.APP_NAME;
  switch (type) {
    case 'WORKER':
      return worker(cs);
      break;
    case 'RECOVERY':
      return recovery(cs);
      break;
    case 'DEAD-LETTERS':
      return deadLetters(cs);
      break;
  }
};
