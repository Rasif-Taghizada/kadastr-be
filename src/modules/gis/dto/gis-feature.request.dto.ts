import { IsArray, IsObject, IsString, IsOptional, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

export class GeoJSONGeometryDto {
  @IsString()
  type: string;

  coordinates: unknown;
}

export class GeoJSONPropertiesDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  color?: string;

  [key: string]: unknown;
}

export class GeoJSONFeatureDto {
  @IsString()
  type: string;

  @IsString()
  @IsOptional()
  id?: string;

  @IsObject()
  @ValidateNested()
  @Type(() => GeoJSONGeometryDto)
  geometry: GeoJSONGeometryDto;

  @IsObject()
  properties: GeoJSONPropertiesDto;
}

export class SaveFeaturesDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => GeoJSONFeatureDto)
  features: GeoJSONFeatureDto[];
}

export class UploadFeaturesDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => GeoJSONFeatureDto)
  features: GeoJSONFeatureDto[];
}

export class DeleteFeaturesDto {
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  ids: string[];
}
