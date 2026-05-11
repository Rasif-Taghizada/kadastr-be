import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig = (): TypeOrmModuleOptions => {
  const useUrl = !!process.env.DATABASE_URL;
  const sslEnabled = process.env.DB_SSL === 'true' || process.env.NODE_ENV === 'production';

  const base: TypeOrmModuleOptions = {
    type: 'postgres',
    entities: [__dirname + '/../database/entities/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
    logging: process.env.NODE_ENV === 'development',
    ...(sslEnabled && { ssl: { rejectUnauthorized: false } }),
  };

  if (useUrl) {
    return { ...base, url: process.env.DATABASE_URL } as TypeOrmModuleOptions;
  }

  return {
    ...base,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'myapp',
  } as TypeOrmModuleOptions;
};
