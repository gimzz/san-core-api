import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Person } from '../../core/entities/person.entity';

@Entity({ schema: 'auth', name: 'users' })
export class User {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'id_person', unique: true })
  idPerson: number;

  @Column({ unique: true, length: 100 })
  username: string;

  @Column({ name: 'password_hash', length: 255 })
  passwordHash: string;

  @Column({ name: 'reputation_score', type: 'smallint', default: 100 })
  reputationScore: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'referral_code', length: 20, unique: true, nullable: true })
  referralCode: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @OneToOne(() => Person, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_person' })
  person: Person;
}