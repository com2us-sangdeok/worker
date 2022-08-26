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
  PATTERN_UNLOCK,
} from '../messages';
import {RecoveryService} from "./recovery.service";
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Controller()
export class RecoveryController {
  constructor(
    private readonly service: RecoveryService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  @EventPattern(PATTERN_MINT)
  mintEvent(@Payload() payload: MintPayload, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    try {
      this.logger.log(
        `[${context.getPattern()}] requestId: ${payload.requestId}`,
      );
      this.service.mintEvent(payload);
      channel.ack(context.getMessage());
    } catch (e) {
      channel.reject(context.getMessage());
      throw e;
    }
  }

  @EventPattern(PATTERN_CONVERT)
  convertEvent(@Payload() payload: ConvertPayload, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    try {
      this.logger.log(
        `[${context.getPattern()}] requestId: ${payload.requestId}`,
      );
      this.service.convertEvent(payload);
      channel.ack(context.getMessage());
    } catch (e) {
      channel.reject(context.getMessage());
      throw e;
    }
  }

  @EventPattern(PATTERN_LOCK)
  lockEvent(@Payload() payload: LockPayload, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    try {
      this.logger.log(
        `[${context.getPattern()}] requestId: ${payload.requestId}`,
      );
      this.service.lockEvent(payload);
      channel.ack(context.getMessage());
    } catch (e) {
      channel.reject(context.getMessage());
      throw e;
    }
  }

  @EventPattern(PATTERN_UNLOCK)
  unlockEvent(@Payload() payload: UnlockPayload, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    try {
      this.logger.log(
        `[${context.getPattern()}] requestId: ${payload.requestId}`,
      );
      this.service.unlockEvent(payload);
      channel.ack(context.getMessage());
    } catch (e) {
      channel.reject(context.getMessage());
      throw e;
    }
  }
}
