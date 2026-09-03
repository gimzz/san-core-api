import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Person } from '../../core/entities/person.entity';

@Entity({ schema: 'auth', name: 'users' })
export class User {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'id_person', unique: true })
  idPerson: number;

  @Column({ unique: true, length: 100 })
  username: string;

  @Column({ name: 'password_hash', length: 255 })
  passwordHash: string;

  @Column({ name: 'reputation_score', type: 'smallint', default: 100 })
  reputationScore: number;

  @OneToOne(() => Person, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_person' })
  person: Person;
}