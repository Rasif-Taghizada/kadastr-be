import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { UserEntity } from './user.entity';

@Entity('gis_features')
export class GisFeatureEntity extends BaseEntity {
  @Column({ nullable: true })
  name: string;

  @Column({ type: 'jsonb' })
  geometry: object;

  @Column({ type: 'jsonb', default: '{}' })
  properties: object;

  @Column({ default: '#3388ff' })
  color: string;

  @Column({ default: 'Polygon', name: 'feature_type' })
  featureType: string;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: UserEntity;
}
