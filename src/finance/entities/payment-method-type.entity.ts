import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ schema: 'finance', name: 'payment_method_types' })
export class PaymentMethodType {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ unique: true, length: 50 })
  name: string;
}
