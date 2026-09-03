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

    // ─────────────────────────────────────────────
    // CATÁLOGOS MAESTROS
    // ─────────────────────────────────────────────

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

    // ─────────────────────────────────────────────
    // CATÁLOGO DE BANCOS VENEZOLANOS (SUDEBAN)
    // ─────────────────────────────────────────────

    await this.dataSource.query(`
      INSERT INTO "finance"."banks" ("code", "name")
      VALUES 
        ('0102', 'Banco de Venezuela'),
        ('0104', 'Venezolano de Crédito'),
        ('0105', 'Banco Mercantil'),
        ('0108', 'Banco Provincial'),
        ('0114', 'Bancaribe'),
        ('0115', 'Banco Exterior'),
        ('0128', 'Banco Caroní'),
        ('0134', 'Banesco'),
        ('0137', 'Banco Sofitasa'),
        ('0138', 'Banco Plaza'),
        ('0151', 'BFC Banco Fondo Común'),
        ('0156', '100% Banco'),
        ('0157', 'Del Sur Banco Universal'),
        ('0163', 'Banco del Tesoro'),
        ('0166', 'Banco Agrícola de Venezuela'),
        ('0168', 'Bancrecer'),
        ('0169', 'Mi Banco'),
        ('0171', 'Banco Activo'),
        ('0172', 'Bancamiga'),
        ('0174', 'Banplus'),
        ('0175', 'Banco Bicentenario'),
        ('0177', 'Banco de la Fuerza Armada Nacional (BANFANB)'),
        ('0191', 'Banco Nacional de Crédito (BNC)')
      ON CONFLICT ("code") DO NOTHING;
    `);

    // ─────────────────────────────────────────────
    // RESTRICCIONES CHECK (DEFENSIVAS EN BD)
    // ─────────────────────────────────────────────

    // reputation_score entre 0 y 100
    await this.dataSource.query(`
      DO $$ BEGIN
        ALTER TABLE "auth"."users" 
        ADD CONSTRAINT "chk_reputation_score_range" 
        CHECK ("reputation_score" >= 0 AND "reputation_score" <= 100);
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);

    // bank_code debe tener exactamente 4 dígitos cuando no es nulo
    await this.dataSource.query(`
      DO $$ BEGIN
        ALTER TABLE "finance"."user_payment_methods" 
        ADD CONSTRAINT "chk_bank_code_format" 
        CHECK ("bank_code" IS NULL OR "bank_code" ~ '^\\d{4}$');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);

    // document_number no puede estar vacío
    await this.dataSource.query(`
      DO $$ BEGIN
        ALTER TABLE "core"."person_documents" 
        ADD CONSTRAINT "chk_document_number_not_empty" 
        CHECK (LENGTH(TRIM("document_number")) > 0);
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);

    // contact_value no puede estar vacío
    await this.dataSource.query(`
      DO $$ BEGIN
        ALTER TABLE "core"."person_contacts" 
        ADD CONSTRAINT "chk_contact_value_not_empty" 
        CHECK (LENGTH(TRIM("contact_value")) > 0);
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);

    this.logger.log('✅ Esquemas, catálogos maestros, bancos SUDEBAN y restricciones CHECK inicializados con éxito');
  }
}