import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('Metadata')
export class MetadataEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ type: 'varchar', nullable: false, length: 50 })
  fileName: string;

  @Column({ type: 'varchar', nullable: false })
  uri: string;

  @CreateDateColumn()
  createdAt: string;
}
