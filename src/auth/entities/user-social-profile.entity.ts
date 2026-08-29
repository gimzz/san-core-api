import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';

@Entity({ schema: 'auth', name: 'user_social_profiles' })
@Index(['provider', 'providerUserId'], { unique: true })
export class UserSocialProfile {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'id_user' })
  idUser: number;

  @Column({ length: 50 })
  provider: string;

  @Column({ name: 'provider_user_id', length: 150 })
  providerUserId: string;

  @Column({ name: 'profile_url', length: 255, nullable: true })
  profileUrl: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_user' })
  user: User;
}
