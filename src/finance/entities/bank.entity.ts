import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ schema: 'finance', name: 'banks' })
export class Bank {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ length: 4, unique: true })
  code: string;

  @Column({ length: 100 })
  name: string;
}
