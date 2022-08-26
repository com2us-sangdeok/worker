import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('ConvertPool')
export class ConvertPoolEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  appName: string;

  @Column({ type: 'numeric', default: 0 })
  lowerGameCurrency: number;

  @Column({ type: 'numeric', default: 0 })
  gameToken: number;

  @Column({ type: 'numeric', default: 0 })
  upperGameCurrency: number;

  @Column({ type: 'numeric', default: 0 })
  ctx: number;

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updatedAt: string;
}
