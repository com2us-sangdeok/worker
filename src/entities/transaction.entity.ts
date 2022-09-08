import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  Index,
} from 'typeorm';
import { TxType } from '../enum';
import { TxStatus } from '../enum';

@Entity('transaction')
export class TransactionEntity {
  constructor(options?: Partial<TransactionEntity>) {
    Object.assign(this, options);
  }

  @PrimaryGeneratedColumn('increment')
  id: number;

  @PrimaryColumn({ type: 'varchar', primary: true })
  @Index('idx-requestId')
  requestId: string;

  @Column({ type: 'varchar', length: 100, nullable: true, default: null })
  @Index('idx-sender')
  senderAddress: string;

  @Column({ type: 'varchar', length: 100, nullable: true, default: null })
  @Index('idx-contract')
  contractAddress?: string;

  @Column({ type: 'varchar', length: 100, nullable: true, default: null })
  @Index('idx-txHash')
  txHash?: string;

  @Column({ type: 'text', nullable: true, default: null })
  tx: string;

  @Column({ type: 'text', nullable: true, default: null })
  params: string;

  @Column({ type: 'enum', enum: TxType })
  txType: TxType;

  @Column({ type: 'varchar' })
  @Index('idx-appId')
  appId: string;

  @Column({ type: 'bigint' })
  @Index('idx-pId')
  playerId: number;

  @Column({ type: 'enum', enum: TxStatus, default: TxStatus.WAIT })
  status: TxStatus;

  @Column({ type: 'text', nullable: true, default: null })
  message?: string;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updateAt: Date;
}
