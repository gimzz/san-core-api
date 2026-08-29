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

export enum RoundStatus {
  PENDING = 'PENDING',
  COLLECTING = 'COLLECTING',
  READY_FOR_PAYOUT = 'READY_FOR_PAYOUT',
  PAID_OUT = 'PAID_OUT',
  OVERDUE = 'OVERDUE',
}

@Entity({ schema: 'san', name: 'rounds' })
@Index(['idCircle', 'roundNumber'], { unique: true })
export class Round {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'id_circle' })
  idCircle: number;

  @Column({ name: 'round_number', type: 'smallint' })
  roundNumber: number;

  @Column({ name: 'id_beneficiary' })
  idBeneficiary: number;

  @Column({ name: 'target_amount', type: 'decimal', precision: 12, scale: 2 })
  targetAmount: number;

  @Column({ name: 'payout_fee_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  payoutFeeAmount: number;

  @Column({ name: 'start_date', type: 'timestamptz' })
  startDate: Date;

  @Column({ name: 'due_date', type: 'timestamptz' })
  dueDate: Date;

  @Column({
    type: 'enum',
    enum: RoundStatus,
    default: RoundStatus.PENDING,
  })
  status: RoundStatus;

  @ManyToOne(() => Circle, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_circle' })
  circle: Circle;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_beneficiary' })
  beneficiary: User;
}
