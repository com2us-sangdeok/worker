import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
  Index,
} from 'typeorm';
import { TxType } from '../enum';
import { TxStatus } from '../enum';

@Entity('transaction')
export class TransactionEntity {
  constructor(options?: Partial<TransactionEntity>) {
    Object.assign(this, options);
  }

  @PrimaryColumn({ type: 'varchar', primary: true })
  @Index('idx-requestId')
  requestId: string;

  @Column({ type: 'varchar', length: 100 })
  @Index('idx-sender')
  senderAddress: string;

  //TODO. minterAddress로 바뀔수도 있음
  @Column({ type: 'varchar', length: 100 })
  @Index('idx-granter')
  granterAddress: string;

  @Column({ type: 'varchar', length: 100 })
  @Index('idx-contract')
  contractAddress: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  @Index('idx-txHash')
  txHash?: string;

  @Column({ type: 'text' })
  tx: string;

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

  @Column({ type: 'text' })
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
