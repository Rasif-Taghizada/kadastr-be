import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GisFeatureEntity } from '@/database/entities';
import { GisFeatureRepository } from './repositories/gis-feature.repository';
import { GisFeatureService } from './services/gis-feature.service';
import { GisFeatureController } from './controllers/gis-feature.controller';

@Module({
  imports: [TypeOrmModule.forFeature([GisFeatureEntity])],
  providers: [GisFeatureRepository, GisFeatureService],
  controllers: [GisFeatureController],
})
export class GisModule {}
