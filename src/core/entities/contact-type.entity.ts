import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ schema: 'core', name: 'contact_types' })
export class ContactType {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ unique: true, length: 50 })
  name: string;
}
