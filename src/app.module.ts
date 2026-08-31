import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getTypeOrmConfig, customDataSourceFactory } from './config/typeorm.config';
import { DatabaseInitModule } from './database/database-init.module';
import { AuthModule } from './auth/auth.module';
import { CoreModule } from './core/core.module';
import { FinanceModule } from './finance/finance.module';
import { LedgerModule } from './ledger/ledger.module';
import { SanModule } from './san/san.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => getTypeOrmConfig(configService),
      dataSourceFactory: customDataSourceFactory,
    }),

    DatabaseInitModule,
    AuthModule,
    CoreModule,
    FinanceModule,
    LedgerModule,
    SanModule,
  ],
})
export class AppModule { }
