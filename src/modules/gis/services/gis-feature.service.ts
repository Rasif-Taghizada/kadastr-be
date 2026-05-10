import { Injectable } from '@nestjs/common';
import { GisFeatureRepository } from '../repositories/gis-feature.repository';
import { GisFeatureConverter } from '../converters/gis-feature.converter';
import type { SaveFeaturesDto, UploadFeaturesDto, GeoJSONFeatureDto } from '../dto/gis-feature.request.dto';
import type { GeoJSONFeatureCollectionDto } from '../dto/gis-feature.response.dto';

@Injectable()
export class GisFeatureService {
  constructor(private readonly gisFeatureRepository: GisFeatureRepository) {}

  async findAll(): Promise<GeoJSONFeatureCollectionDto> {
    const features = await this.gisFeatureRepository.findAll();
    return GisFeatureConverter.toFeatureCollection(features);
  }

  async saveFeatures(dto: SaveFeaturesDto, userId: string): Promise<{ saved: number }> {
    await Promise.all(
      dto.features.map((f: GeoJSONFeatureDto) =>
        this.gisFeatureRepository.upsert({
          id: f.id || f.properties?.id as string,
          name: f.properties?.name as string | undefined,
          geometry: f.geometry as object,
          properties: f.properties as object,
          color: (f.properties?.color as string) || '#3388ff',
          featureType: f.geometry?.type || 'Polygon',
          createdById: userId,
        }),
      ),
    );

    return { saved: dto.features.length };
  }

  async uploadFeatures(dto: UploadFeaturesDto, userId: string): Promise<{ imported: number }> {
    await Promise.all(
      dto.features.map((f: GeoJSONFeatureDto) =>
        this.gisFeatureRepository.upsert({
          name:
            (f.properties?.name as string) ||
            (f.properties?.NAME as string) ||
            (f.properties?.ad as string) ||
            undefined,
          geometry: f.geometry as object,
          properties: f.properties as object,
          color: '#3388ff',
          featureType: f.geometry?.type || 'Polygon',
          createdById: userId,
        }),
      ),
    );

    return { imported: dto.features.length };
  }

  async deleteById(id: string): Promise<{ success: boolean }> {
    await this.gisFeatureRepository.deleteById(id);
    return { success: true };
  }

  async deleteByIds(ids: string[]): Promise<{ deleted: number }> {
    await this.gisFeatureRepository.deleteByIds(ids);
    return { deleted: ids.length };
  }
}
