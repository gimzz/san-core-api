import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Round } from './round.entity';
import { User } from '../../auth/entities/user.entity';
import { UserPaymentMethod } from '../../finance/entities/user-payment-method.entity';
import { Currency } from '../../finance/entities/currency.entity';

export enum PaymentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  REJECTED = 'REJECTED',
}

@Entity({ schema: 'san', name: 'payments' })
export class Payment {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'id_round' })
  idRound: number;

  @Column({ name: 'id_user' })
  idUser: number;

  @Column({ name: 'id_user_payment_method' })
  idUserPaymentMethod: number;

  @Column({ name: 'amount_nominal', type: 'decimal', precision: 12, scale: 2 })
  amountNominal: number;

  @Column({ name: 'id_currency' })
  idCurrency: number;

  @Column({ name: 'amount_usd_equivalent', type: 'decimal', precision: 12, scale: 2 })
  amountUsdEquivalent: number;

  @Column({ name: 'exchange_rate_used', type: 'decimal', precision: 12, scale: 4, nullable: true })
  exchangeRateUsed: number;

  @Column({ name: 'reference_code', length: 100 })
  referenceCode: string;

  @Column({ name: 'voucher_url', type: 'text', nullable: true })
  voucherUrl: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({ name: 'idempotency_key', unique: true, length: 64 })
  idempotencyKey: string;

  @Column({ name: 'confirmed_at', type: 'timestamptz', nullable: true })
  confirmedAt: Date;

  @ManyToOne(() => Round, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_round' })
  round: Round;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_user' })
  user: User;

  @ManyToOne(() => UserPaymentMethod, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_user_payment_method' })
  userPaymentMethod: UserPaymentMethod;

  @ManyToOne(() => Currency, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_currency' })
  currency: Currency;
}
