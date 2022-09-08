import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
} from 'typeorm';
import { MintType, MintLogStatus } from '../enum';

@Entity('tb_mint_log')
export class MintLogEntity {
  @PrimaryColumn({name: 'request_id', type: 'varchar' })
  requestId: string;

  @Column({ name: 'mint_type', type: 'enum', enum: MintType, default: MintType.ITEM })
  mintType: MintType;

  @Column({ name: 'player_id', type: 'bigint' })
  playerId: number;

  @Column({ name: 'server', type: 'varchar' })
  server: string;

  @Column({ name: 'acc_address', type: 'varchar' })
  accAddress: string;

  @Column({ name: 'app_id', type: 'varchar' })
  appId: string;

  @Column({ name: 'id', type: 'varchar' })
  id: string;

  @Column({ name: 'metadata', type: 'json' })
  metadata: any;

  @Column({ name: 'service_fee', type: 'varchar' })
  serviceFee: string;

  @Column({ name: 'game_fee', type: 'varchar' })
  gameFee: string;

  @Column({ name: 'status', type: 'enum', enum: MintLogStatus, default: MintLogStatus.READY })
  status: MintLogStatus;

  @CreateDateColumn({name: 'created_at'})
  createdAt: string;
}