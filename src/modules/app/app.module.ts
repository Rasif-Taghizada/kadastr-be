import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { envConfig, databaseConfig, throttlerConfig } from '@/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '@/modules/auth/auth.module';
import { UserModule } from '@/modules/user/user.module';
import { GisModule } from '@/modules/gis/gis.module';

@Module({
  imports: [
    ConfigModule.forRoot(envConfig),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: databaseConfig,
    }),
    ThrottlerModule.forRoot(throttlerConfig),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),

    // Feature modules
    AuthModule,
    UserModule,
    GisModule,
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    AppService,
  ],
})
export class AppModule {}
