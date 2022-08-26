import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { SequenceEntity } from '../../entities/sequence.entity';

@Injectable()
export class SequenceRepository {
  constructor(
    @InjectRepository(SequenceEntity)
    private readonly seqRepo: Repository<SequenceEntity>,
  ) {}

  public async getSequenceNumber(
    queryRunner: QueryRunner,
    address: string,
  ): Promise<SequenceEntity> {
    let nonceProviderEntity = await queryRunner.manager
      .getRepository(SequenceEntity)
      .createQueryBuilder('sequenceEntity')
      .useTransaction(true)
      .setLock('pessimistic_read')
      .setLock('pessimistic_write')
      .where('accAddress = :accAddress', { accAddress: address })
      .getOne();
    if (nonceProviderEntity === undefined || nonceProviderEntity === null) {
      nonceProviderEntity = <SequenceEntity>{
        accAddress: address,
        sequenceNumber: -1,
      };
    }
    return nonceProviderEntity;
  }

  public async registerSequence(
    queryRunner: QueryRunner,
    address: string,
    sequenceNumber: number,
  ): Promise<void> {
    await queryRunner.manager
      .getRepository(SequenceEntity)
      .createQueryBuilder('sequenceEntity')
      .useTransaction(true)
      .setLock('pessimistic_read')
      .setLock('pessimistic_write')
      .insert()
      .into(SequenceEntity)
      .values([{ accAddress: address, sequenceNumber: sequenceNumber }])
      .execute();
  }

  public async updateSequenceFromBlockchain(
    queryRunner: QueryRunner,
    address: string,
    sequenceNumber: number,
  ): Promise<void> {
    await queryRunner.manager
      .getRepository(SequenceEntity)
      .createQueryBuilder('sequenceEntity')
      .useTransaction(true)
      .setLock('pessimistic_read')
      .setLock('pessimistic_write')
      .update(SequenceEntity)
      .set({ sequenceNumber: sequenceNumber })
      .where('accAddress = :accAddress', { accAddress: address })
      .execute();
  }

  public async updateSequenceFromDb(
    queryRunner: QueryRunner,
    address: string,
    oldSequenceNumber: number,
  ): Promise<void> {
    const sequenceNumber = Number(oldSequenceNumber) + 1;
    await queryRunner.manager
      .getRepository(SequenceEntity)
      .createQueryBuilder('sequenceEntity')
      .useTransaction(true)
      .setLock('pessimistic_read')
      .setLock('pessimistic_write')
      .update(SequenceEntity)
      .set({ sequenceNumber: sequenceNumber })
      .where('accAddress = :accAddress', { accAddress: address })
      .execute();
  }
}
