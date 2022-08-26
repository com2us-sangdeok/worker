import { Controller, Inject, LoggerService } from '@nestjs/common';
import {ClientProxy, Ctx, EventPattern, Payload, RmqContext} from '@nestjs/microservices';
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
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import {DeadLettersService} from "./dead-letters.service";

@Controller()
export class DeadLettersController {
  constructor(
    private readonly service: DeadLettersService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  @EventPattern(PATTERN_MINT)
  async mintEvent(@Payload() payload: MintPayload, @Ctx() context: RmqContext) {
    // todo: check delayed message
    const channel = await context.getChannelRef();
    try {
      this.logger.debug(
          `[${context.getPattern()}] [${payload.gameIndex}] 
          requestId: ${payload.requestId}`,
      );

      await this.service.mintEvent(payload);
    } catch (e) {
      this.logger.error(e)
    } finally {
      await channel.ack(context.getMessage());
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
      throw e;
    }
  }

  @EventPattern(PATTERN_TEST)
  testEvent(
      @Payload() payload: TestPayload,
      @Ctx() context: RmqContext,
  ) {
    this.logger.log(`Pattern: ${context.getPattern()}`);
    this.logger.error(
        `Dead-letters finished for ${payload.id} 🔥`,
    );
    const channel = context.getChannelRef();
    channel.ack(context.getMessage());
  }
}
