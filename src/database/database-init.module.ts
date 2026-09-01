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

    await this.dataSource.query(`
      ALTER TABLE "finance"."currencies" 
      ALTER COLUMN "code" TYPE varchar(10);
    `).catch(() => {
    });

    await this.dataSource.query(`
      INSERT INTO "core"."document_types" ("id", "name")
      VALUES 
        (1, 'CEDULA'),
        (2, 'PASAPORTE'),
        (3, 'RIF')
      ON CONFLICT ("name") DO NOTHING;
    `);

    await this.dataSource.query(`
      INSERT INTO "core"."contact_types" ("id", "name")
      VALUES 
        (1, 'WHATSAPP'),
        (2, 'TELEFONO_MOVIL'),
        (3, 'CORREO_ELECTRONICO')
      ON CONFLICT ("name") DO NOTHING;
    `);

    await this.dataSource.query(`
      INSERT INTO "finance"."currencies" ("id", "code", "symbol", "name")
      VALUES 
        (1, 'USD', '$', 'US Dollar'),
        (2, 'VES', 'Bs.', 'Bolívar Digital'),
        (3, 'USDT', '₮', 'Tether USD'),
        (4, 'EUR', '€', 'Euro')
      ON CONFLICT ("code") DO NOTHING;
    `);

    await this.dataSource.query(`
      INSERT INTO "finance"."payment_method_types" ("id", "name")
      VALUES 
        (1, 'PAGO_MOVIL'),
        (2, 'BINANCE_PAY'),
        (3, 'TRANSFERENCIA_BANCARIA'),
        (4, 'EFECTIVO')
      ON CONFLICT ("name") DO NOTHING;
    `);

    this.logger.log('✅ Esquemas y catálogos maestros inicializados con éxito');
  }
}