import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ schema: 'core', name: 'persons' })
export class Person {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'first_name', length: 50 })
  firstName: string;

  @Column({ name: 'second_name', length: 50, nullable: true })
  secondName: string;

  @Column({ name: 'first_last_name', length: 50 })
  firstLastName: string;

  @Column({ name: 'second_last_name', length: 50, nullable: true })
  secondLastName: string;

  @Column({ name: 'birth_date', type: 'date', nullable: true })
  birthDate: string;
}
