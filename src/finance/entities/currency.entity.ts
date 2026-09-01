import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ schema: 'finance', name: 'currencies' })
export class Currency {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ unique: true, length: 10 })
  code: string;

  @Column({ length: 5 })
  symbol: string;

  @Column({ length: 50 })
  name: string;
}
