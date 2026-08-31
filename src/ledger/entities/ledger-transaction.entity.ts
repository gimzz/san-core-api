import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';

@Entity({ schema: 'ledger', name: 'ledger_transactions' })
export class LedgerTransaction {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'id_circle', nullable: true })
  idCircle: number;

  @Column({ name: 'id_payment', unique: true, nullable: true })
  idPayment: number;

  @Column({ length: 255 })
  description: string;
}
