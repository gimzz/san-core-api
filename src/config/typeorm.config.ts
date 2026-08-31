import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';

export const getTypeOrmConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get<string>('DB_HOST', 'localhost'),
  port: parseInt(configService.get<string>('DB_PORT', '5432'), 10),
  username: configService.get<string>('DB_USERNAME', 'bolso_user'),
  password: configService.get<string>('DB_PASSWORD', 'bolso_password'),
  database: configService.get<string>('DB_NAME', 'bolso_db'),
  autoLoadEntities: true,
  logging: false,
});

export const customDataSourceFactory = async (options?: DataSourceOptions) => {
  if (!options) {
    throw new Error('Invalid options passed to dataSourceFactory');
  }
  // Create pre-connection without synchronize to auto-create missing PostgreSQL schemas
  const schemaInitializer = new DataSource({
    ...options,
    synchronize: false,
  });
  await schemaInitializer.initialize();

  const schemas = ['auth', 'core', 'finance', 'ledger', 'san'];
  for (const schema of schemas) {
    await schemaInitializer.query(`CREATE SCHEMA IF NOT EXISTS "${schema}";`);
  }
  await schemaInitializer.destroy();

  // Initialize primary DataSource with synchronize enabled
  const dataSource = new DataSource(options);
  return dataSource.initialize();
};
