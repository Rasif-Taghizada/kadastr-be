import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';
import { UserRole } from '@/constants/enums';

@Entity('users')
export class UserEntity extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ nullable: true, name: 'first_name' })
  firstName: string;

  @Column({ nullable: true, name: 'last_name' })
  lastName: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;
}
