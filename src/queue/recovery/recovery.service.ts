import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ConvertPayload,
  LockPayload,
  MintPayload,
  PATTERN_MINT,
  UnlockPayload,
} from '../messages';
import {
  QueueException,
  QueueHttpStatus,
} from '../../exception/queue.exception';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Injectable()
export class RecoveryService {
  constructor(
    @Inject('RECOVERY') private client: ClientProxy,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  emit(payload: MintPayload) {
    this.client.emit(PATTERN_MINT, payload);
  }

  mintEvent(payload: MintPayload) {
    try {
      this.logger.log(`payload: ${payload}`);
      // todo: minter log update
      //   call game server to complete
    } catch (e) {
      throw new QueueException(
        e.message,
        e,
        QueueHttpStatus.MINTING_PROCESS_FAILED,
      );
    }
  }

  convertEvent(payload: ConvertPayload) {
    try {
      this.logger.log(`payload: ${payload}`);
      // todo: convert log update
      //   call game server to complete
      //   update convert pool
    } catch (e) {
      throw new QueueException(
        e.message,
        e,
        QueueHttpStatus.CONVERTING_PROCESS_FAILED,
      );
    }
  }

  lockEvent(payload: LockPayload) {
    try {
      this.logger.log(`payload: ${payload}`);
      // todo: lock log update
      //   call game server to complete
    } catch (e) {
      throw new QueueException(
        e.message,
        e,
        QueueHttpStatus.LOCKING_PROCESS_FAILED,
      );
    }
  }

  unlockEvent(payload: UnlockPayload) {
    try {
      this.logger.log(`payload: ${payload}`);
      // todo: unlock log update
      //   call game server to complete
    } catch (e) {
      throw new QueueException(
        e.message,
        e,
        QueueHttpStatus.UNLOCKING_PROCESS_FAILED,
      );
    }
  }
}
