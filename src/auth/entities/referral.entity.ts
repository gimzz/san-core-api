import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity({ schema: 'auth', name: 'referrals' })
export class Referral {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'id_referrer_user' })
  idReferrerUser: number;

  @Column({ name: 'id_referred_user', unique: true })
  idReferredUser: number;

  @Column({ length: 30, default: 'PENDING' })
  status: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_referrer_user' })
  referrerUser: User;

  @OneToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_referred_user' })
  referredUser: User;
}
