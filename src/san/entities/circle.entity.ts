import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Currency } from '../../finance/entities/currency.entity';

export enum CircleStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  DEFAULTED = 'DEFAULTED',
  CANCELLED = 'CANCELLED',
}

@Entity({ schema: 'san', name: 'circles' })
export class Circle {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'id_admin' })
  idAdmin: number;

  @Column({ length: 100 })
  name: string;

  @Column({ name: 'invite_code', unique: true, length: 16 })
  inviteCode: string;

  @Column({ name: 'contribution_amount', type: 'decimal', precision: 12, scale: 2 })
  contributionAmount: number;

  @Column({ name: 'id_currency' })
  idCurrency: number;

  @Column({ name: 'total_slots', type: 'smallint' })
  totalSlots: number;

  @Column({ name: 'frequency_days', type: 'smallint', default: 7 })
  frequencyDays: number;

  @Column({ name: 'cashout_fee_percentage', type: 'decimal', precision: 4, scale: 2, default: 2 })
  cashoutFeePercentage: number;

  @Column({
    type: 'enum',
    enum: CircleStatus,
    default: CircleStatus.PENDING,
  })
  status: CircleStatus;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_admin' })
  admin: User;

  @ManyToOne(() => Currency, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_currency' })
  currency: Currency;
}
