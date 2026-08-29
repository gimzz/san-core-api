import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Circle } from './circle.entity';
import { User } from '../../auth/entities/user.entity';

@Entity({ schema: 'san', name: 'circle_members' })
@Index(['idCircle', 'slotNumber'], { unique: true })
@Index(['idCircle', 'idUser'], { unique: true })
export class CircleMember {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'id_circle' })
  idCircle: number;

  @Column({ name: 'id_user' })
  idUser: number;

  @Column({ name: 'slot_number', type: 'smallint' })
  slotNumber: number;

  @ManyToOne(() => Circle, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_circle' })
  circle: Circle;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_user' })
  user: User;
}
