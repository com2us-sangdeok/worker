import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
  Index, PrimaryGeneratedColumn,
} from 'typeorm';
import { TxType } from '../enum';
import { TxStatus } from '../enum';

@Entity('EventError')
export class EventErrorEntity {
  constructor(options?: Partial<EventErrorEntity>) {
    Object.assign(this, options);
  }

  @PrimaryGeneratedColumn()
  tokenId: number;

  @Column({ type: 'varchar' })
  @Index('idx-requestId')
  requestId: string;

  @Column({ type: 'enum', enum: TxType })
  txType: TxType;

  @Column({ type: 'varchar', length: 100 })
  @Index('idx-txHash')
  txHash?: string;

  // @Column({ type: 'text' })
  // tx: string;

  @Column({ type: 'varchar' })
  appId: string;

  @Column({ type: 'bigint' })
  playerId: number;

  @Column({ type: 'text' })
  message: string;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createAt: Date;
}
