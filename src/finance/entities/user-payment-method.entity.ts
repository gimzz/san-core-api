import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { PaymentMethodType } from './payment-method-type.entity';

@Entity({ schema: 'finance', name: 'user_payment_methods' })
export class UserPaymentMethod {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'id_user' })
  idUser: number;

  @Column({ name: 'id_payment_method_type' })
  idPaymentMethodType: number;

  @Column({ name: 'bank_code', length: 4, nullable: true })
  bankCode: string;

  @Column({ name: 'phone_number', length: 20, nullable: true })
  phoneNumber: string;

  @Column({ name: 'account_number', length: 30, nullable: true })
  accountNumber: string;

  @Column({ name: 'wallet_address', length: 255, nullable: true })
  walletAddress: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_user' })
  user: User;

  @ManyToOne(() => PaymentMethodType, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_payment_method_type' })
  paymentMethodType: PaymentMethodType;
}
