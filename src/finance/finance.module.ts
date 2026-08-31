import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Currency } from './entities/currency.entity';
import { PaymentMethodType } from './entities/payment-method-type.entity';
import { UserPaymentMethod } from './entities/user-payment-method.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Currency,
      PaymentMethodType,
      UserPaymentMethod,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class FinanceModule {}
