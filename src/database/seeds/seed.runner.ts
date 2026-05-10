import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [__dirname + '/../entities/*.entity{.ts,.js}'],
});

async function runSeeds() {
  await dataSource.initialize();
  console.log('Database connected. Running seeds...');

  // Import and run seeders here:
  // await new UserSeeder(dataSource).run();

  await dataSource.destroy();
  console.log('Seeding complete.');
}

runSeeds().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
