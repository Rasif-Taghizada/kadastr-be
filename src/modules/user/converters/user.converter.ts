import { UserEntity } from '@/database/entities/user.entity';
import { UserResponseDto } from '../dto/user.response.dto';

export class UserConverter {
  static toDto(entity: UserEntity): UserResponseDto {
    return {
      id: entity.id,
      email: entity.email,
      firstName: entity.firstName,
      lastName: entity.lastName,
      role: entity.role,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
    };
  }

  static toDtoList(entities: UserEntity[]): UserResponseDto[] {
    return entities.map(UserConverter.toDto);
  }
}
