import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

const ssl = process.env.DB_SSL === 'true' ? { ssl: { rejectUnauthorized: false } } : {};

const options: DataSourceOptions = process.env.DATABASE_URL
  ? {
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [__dirname + '/../entities/*.entity{.ts,.js}'],
      synchronize: true,
      ...ssl,
    }
  : {
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [__dirname + '/../entities/*.entity{.ts,.js}'],
      synchronize: true,
      ...ssl,
    };

const dataSource = new DataSource(options);

async function runSeeds() {
  await dataSource.initialize();
  console.log('Database connected. Running seeds...');

  const { GisFeatureSeeder } = await import('./gis-feature.seeder');
  await new GisFeatureSeeder(dataSource).run();

  await dataSource.destroy();
  console.log('Seeding complete.');
}

runSeeds().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
