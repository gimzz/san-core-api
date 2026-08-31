import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { LedgerTransaction } from './ledger-transaction.entity';
import { LedgerAccount } from './ledger-account.entity';

export enum EntryDirection {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT',
}

@Entity({ schema: 'ledger', name: 'ledger_entries' })
export class LedgerEntry {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'id_transaction' })
  idTransaction: number;

  @Column({ name: 'id_account' })
  idAccount: number;

  @Column({
    type: 'enum',
    enum: EntryDirection,
  })
  direction: EntryDirection;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @ManyToOne(() => LedgerTransaction, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_transaction' })
  transaction: LedgerTransaction;

  @ManyToOne(() => LedgerAccount, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_account' })
  account: LedgerAccount;
}
