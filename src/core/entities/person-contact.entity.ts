import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Person } from './person.entity';
import { ContactType } from './contact-type.entity';

@Entity({ schema: 'core', name: 'person_contacts' })
export class PersonContact {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'id_person' })
  idPerson: number;

  @Column({ name: 'id_contact_type' })
  idContactType: number;

  @Column({ name: 'contact_value', length: 255 })
  contactValue: string;

  @ManyToOne(() => Person, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_person' })
  person: Person;

  @ManyToOne(() => ContactType, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_contact_type' })
  contactType: ContactType;
}
