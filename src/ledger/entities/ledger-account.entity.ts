import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Currency } from '../../finance/entities/currency.entity';

@Entity({ schema: 'ledger', name: 'ledger_accounts' })
export class LedgerAccount {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'id_user', nullable: true })
  idUser: number;

  @Column({ name: 'id_currency' })
  idCurrency: number;

  @Column({ name: 'account_code', unique: true, length: 64 })
  accountCode: string;

  @Column({ length: 255 })
  description: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT', nullable: true })
  @JoinColumn({ name: 'id_user' })
  user: User;

  @ManyToOne(() => Currency, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_currency' })
  currency: Currency;
}
