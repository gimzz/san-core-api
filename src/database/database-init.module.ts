import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Module({})
export class DatabaseInitModule implements OnModuleInit {
  private readonly logger = new Logger(DatabaseInitModule.name);

  constructor(private readonly dataSource: DataSource) { }

  async onModuleInit() {
    const schemas = ['auth', 'core', 'finance', 'ledger', 'san'];
    for (const schema of schemas) {
      await this.dataSource.query(`CREATE SCHEMA IF NOT EXISTS "${schema}";`);
    }
    this.logger.log('✅ All database schemas (auth, core, finance, ledger, san) verified/created successfully');
  }
}
