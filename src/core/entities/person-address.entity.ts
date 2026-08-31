import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Person } from './person.entity';

@Entity({ schema: 'core', name: 'person_addresses' })
export class PersonAddress {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'id_person' })
  idPerson: number;

  @Column({ name: 'street_address', type: 'text' })
  streetAddress: string;

  @Column({ length: 100, nullable: true })
  city: string;

  @Column({ length: 100, nullable: true })
  state: string;

  @Column({ name: 'postal_code', length: 20, nullable: true })
  postalCode: string;

  @ManyToOne(() => Person, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_person' })
  person: Person;
}
