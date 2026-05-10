import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { GisFeatureEntity } from '@/database/entities';

@Injectable()
export class GisFeatureRepository {
  constructor(
    @InjectRepository(GisFeatureEntity)
    private readonly repository: Repository<GisFeatureEntity>,
  ) {}

  findAll(): Promise<GisFeatureEntity[]> {
    return this.repository.find({ order: { createdAt: 'ASC' } });
  }

  findById(id: string): Promise<GisFeatureEntity | null> {
    return this.repository.findOne({ where: { id } });
  }

  async upsert(data: {
    id?: string;
    name?: string;
    geometry: object;
    properties: object;
    color: string;
    featureType: string;
    createdById?: string;
  }): Promise<GisFeatureEntity> {
    if (data.id) {
      const existing = await this.repository.findOne({ where: { id: data.id } });
      if (existing) {
        return this.repository.save({
          ...existing,
          name: data.name ?? existing.name,
          geometry: data.geometry,
          properties: data.properties,
          color: data.color,
          featureType: data.featureType,
        });
      }
    }

    const entity = this.repository.create({
      ...(data.id ? { id: data.id } : {}),
      name: data.name,
      geometry: data.geometry,
      properties: data.properties,
      color: data.color,
      featureType: data.featureType,
      ...(data.createdById ? { createdBy: { id: data.createdById } as any } : {}),
    });

    return this.repository.save(entity);
  }

  async deleteById(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async deleteByIds(ids: string[]): Promise<void> {
    await this.repository.delete({ id: In(ids) });
  }
}
