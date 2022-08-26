import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
} from 'typeorm';
import { MintType, MintLogStatus } from '../enum';

@Entity('MintLog')
export class MintLogEntity {
  @PrimaryColumn({ type: 'varchar' })
  requestId: string;

  @Column({ type: 'enum', enum: MintType, default: MintType.ITEM })
  mintType: MintType;

  @Column({ type: 'bigint' })
  playerId: number;

  @Column({ type: 'varchar' })
  server: string;

  @Column({ type: 'varchar' })
  accAddress: string;

  @Column({ type: 'varchar' })
  appId: string;

  @Column({ type: 'varchar' })
  goodsId: string;

  @Column({ type: 'bigint' })
  ctxFee: number;

  @Column({ type: 'bigint' })
  tokenFee: number;

  @Column({ type: 'enum', enum: MintLogStatus, default: MintLogStatus.READY })
  status: MintLogStatus;

  @CreateDateColumn()
  createdAt: string;
}
