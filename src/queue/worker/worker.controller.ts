import { Controller, Inject, LoggerService } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import {
  MintPayload,
  ConvertPayload,
  LockPayload,
  UnlockPayload,
  PATTERN_MINT,
  PATTERN_CONVERT,
  PATTERN_LOCK,
  PATTERN_UNLOCK, PATTERN_TEST, TestPayload,

} from '../messages';
import { WorkerService } from './worker.service';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Controller()
export class WorkerController {
  constructor(
    private readonly service: WorkerService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  @EventPattern(PATTERN_MINT)
  async mintEvent(@Payload() payload: MintPayload, @Ctx() context: RmqContext) {
    const channel = await context.getChannelRef();
    try {
      this.logger.log(
        `[${context.getPattern()}] requestId: ${payload.requestId}`,
      );
      await this.service.mintEvent(payload);
      await channel.ack(context.getMessage());
    } catch (e) {
      this.logger.error(e.message)
      if (e.status === 926) { // retry
        this.logger.error('ack to retry event')
        await channel.ack(context.getMessage());
      } else {
        this.logger.error('reject event')
        await channel.reject(context.getMessage(), false);
      }
    }
  }

  @EventPattern(PATTERN_CONVERT)
  async convertEvent(@Payload() payload: ConvertPayload, @Ctx() context: RmqContext) {
    const channel = await context.getChannelRef();
    try {
      this.logger.log(
          `[${context.getPattern()}] requestId: ${payload.requestId}`,
      );
      await this.service.convertEvent(payload);
      await channel.ack(context.getMessage());
    } catch (e) {
      await channel.reject(context.getMessage(), false);
      throw e;
    }
  }

  @EventPattern(PATTERN_LOCK)
  async lockEvent(@Payload() payload: LockPayload, @Ctx() context: RmqContext) {
    const channel = await context.getChannelRef();
    try {
      this.logger.log(
          `[${context.getPattern()}] requestId: ${payload.requestId}`,
      );
      await this.service.lockEvent(payload);
      await channel.ack(context.getMessage());
    } catch (e) {
      await channel.reject(context.getMessage(), false);
      throw e;
    }
  }

  @EventPattern(PATTERN_UNLOCK)
  async unlockEvent(@Payload() payload: UnlockPayload, @Ctx() context: RmqContext) {
    const channel = await context.getChannelRef();
    try {
      this.logger.log(
        `[${context.getPattern()}] requestId: ${payload.requestId}`,
      );
      await this.service.unlockEvent(payload);
      await channel.ack(context.getMessage());
    } catch (e) {
      await channel.reject(context.getMessage(), false);
      throw e;
    }
  }

  @EventPattern(PATTERN_TEST)
  testEvent(
      @Payload() payload: TestPayload,
      @Ctx() context: RmqContext,
  ) {
    this.logger.log(`Pattern: ${context.getPattern()}`);
    this.logger.log(`context: ${JSON.stringify(context.getMessage())}`);
    this.logger.error(
        `Worker rejected message for ${payload.id} 🔥`,
    );
    const channel = context.getChannelRef();
    channel.reject(context.getMessage(), false);
  }
}
