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

@Entity('tb_event_error')
export class EventErrorEntity {
  constructor(options?: Partial<EventErrorEntity>) {
    Object.assign(this, options);
  }

  @PrimaryGeneratedColumn()
  tokenId: number;

  @Column({ name: 'request_id', type: 'varchar' })
  @Index('idx-requestId')
  requestId: string;

  @Column({ name: 'tx_type', type: 'enum', enum: TxType })
  txType: TxType;

  @Column({ name: 'tx_hash', type: 'varchar', length: 100 })
  @Index('idx-txHash')
  txHash?: string;

  // @Column({ type: 'text' })
  // tx: string;

  @Column({ name: 'app_id', type: 'varchar' })
  appId: string;

  @Column({ name: 'player_id', type: 'bigint' })
  playerId: number;

  @Column({ type: 'text' })
  message: string;

  @CreateDateColumn({
    name: 'create_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createAt: Date;
}
