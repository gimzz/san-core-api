import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../auth/entities/user.entity';
import { UserSocialProfile } from '../auth/entities/user-social-profile.entity';
import { Referral } from '../auth/entities/referral.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';


@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserSocialProfile,
      Referral,
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}