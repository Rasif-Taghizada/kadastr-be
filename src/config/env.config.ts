import { ConfigModuleOptions } from '@nestjs/config';
import { appConfig } from './app.config';
import { databaseConfig } from './database.config';
import { jwtConfig } from './jwt.config';
import { minioConfig } from './minio.config';

export const envConfig: ConfigModuleOptions = {
  isGlobal: true,
  envFilePath: '.env',
  load: [appConfig, databaseConfig, jwtConfig, minioConfig],
};
