import { GisFeatureEntity } from '@/database/entities';
import type { GeoJSONFeatureCollectionDto, GeoJSONFeatureDto } from '../dto/gis-feature.response.dto';

export class GisFeatureConverter {
  static toGeoJSONFeature(entity: GisFeatureEntity): GeoJSONFeatureDto {
    return {
      type: 'Feature',
      id: entity.id,
      geometry: entity.geometry,
      properties: {
        ...(entity.properties as object),
        id: entity.id,
        name: entity.name,
        color: entity.color,
        featureType: entity.featureType,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
      },
    };
  }

  static toFeatureCollection(entities: GisFeatureEntity[]): GeoJSONFeatureCollectionDto {
    return {
      type: 'FeatureCollection',
      features: entities.map(GisFeatureConverter.toGeoJSONFeature),
    };
  }
}
