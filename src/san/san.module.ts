import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Circle } from './entities/circle.entity';
import { CircleMember } from './entities/circle-member.entity';
import { Round } from './entities/round.entity';
import { Payment } from './entities/payment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Circle,
      CircleMember,
      Round,
      Payment,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class SanModule {}
