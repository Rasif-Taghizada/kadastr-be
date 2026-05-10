import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module';
import { mainConfig } from '@/config/main.config';
import { appConfig } from '@/config/app.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  mainConfig(app);
  await app.listen(appConfig().port);
}
bootstrap();
