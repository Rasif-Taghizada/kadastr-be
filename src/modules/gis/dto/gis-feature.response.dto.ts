export class GisFeatureResponseDto {
  id: string;
  name: string | null;
  geometry: object;
  properties: object;
  color: string;
  featureType: string;
  createdAt: Date;
  updatedAt: Date;
}

export class GeoJSONFeatureDto {
  type: 'Feature';
  id: string;
  geometry: object;
  properties: object;
}

export class GeoJSONFeatureCollectionDto {
  type: 'FeatureCollection';
  features: GeoJSONFeatureDto[];
}
