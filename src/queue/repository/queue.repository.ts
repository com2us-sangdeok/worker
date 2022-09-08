import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {Repository, UpdateResult} from 'typeorm';
import {
  TransactionEntity,
  MintLogEntity,
} from '../../entities';
import {EventErrorEntity} from "../../entities/event-error.entity";

@Injectable()
export class QueueRepository {
  constructor(
    // @InjectRepository(NonFungibleTokenEntity)
    // private readonly nftRepo: Repository<NonFungibleTokenEntity>,
    @InjectRepository(TransactionEntity)
    private readonly txRepo: Repository<TransactionEntity>,
    @InjectRepository(MintLogEntity)
    private readonly mintLogRepo: Repository<MintLogEntity>,
    @InjectRepository(EventErrorEntity)
    private readonly eventErrorRepo: Repository<EventErrorEntity>,
  ) {}

  // public async getNftId(nftEntity: NonFungibleTokenEntity): Promise<number> {
  //   // const existedToken = this.nftRepo.findOneBy({appName: nftEntity.appName})
  //   // if (existedToken === undefined || existedToken === null) {
  //   // }
  //   const token = await this.nftRepo
  //     .createQueryBuilder()
  //     .insert()
  //     .into(NonFungibleTokenEntity)
  //     .values([
  //       {
  //         gameIndex: nftEntity.gameIndex,
  //         accAddress: nftEntity.accAddress,
  //         playerId: nftEntity.playerId,
  //       },
  //     ])
  //     .execute();
  //   return token.raw.insertId;
  // }
  //
  // public async registerTx(tx: TransactionEntity): Promise<void> {
  //   await this.txRepo.save(tx);
  // }

  // public async getTxByRequestId(requestId: string): Promise<TransactionEntity> {
  //   return await this.txRepo.findOneBy({ requestId: requestId });
  // }

  /**
   * minter log
   */
  public async getMintLogByRequestId(
      requestId: string,
  ): Promise<MintLogEntity> {
    return await this.mintLogRepo.findOneBy({requestId: requestId})
  }

  public async updateMintLogByRequestId(
    entity: MintLogEntity,
  ) {
    // await this.mintLogRepo.update(entity.requestId, {
    //   status: () => entity.status
    // })
    return await this.mintLogRepo
      .createQueryBuilder()
      .update(MintLogEntity)
      .set({ status: entity.status })
      .where('request_id = :requestId', { requestId: entity.requestId })
      .execute();
  }

  /**
   * transaction
   */
  public async updateTransactionByRequestId(entity: TransactionEntity) {
    return await this.txRepo
        .createQueryBuilder()
        .update(TransactionEntity)
        .set({ status: entity.status })
        .where('request_id = :requestId', { requestId: entity.requestId })
        .execute();
  }

  /**
   * event error
   */
  public async registerEventError(entity: EventErrorEntity): Promise<void> {
    await this.eventErrorRepo.save(entity);
  }




}
