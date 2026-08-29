import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LedgerAccount } from './entities/ledger-account.entity';
import { LedgerTransaction } from './entities/ledger-transaction.entity';
import { LedgerEntry } from './entities/ledger-entry.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LedgerAccount,
      LedgerTransaction,
      LedgerEntry,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class LedgerModule {}
