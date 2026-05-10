import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../user.repository';
import { UserConverter } from '../converters/user.converter';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { getPaginationOptions } from '@/common/utils/pagination.utils';
import { UserResponseDto } from '../dto/user.response.dto';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async findAll(query: PaginationQueryDto): Promise<PaginationDto<UserResponseDto>> {
    const { skip, take, page, limit } = getPaginationOptions(query);
    const [data, total] = await this.userRepository.findAll(skip, take);
    return new PaginationDto(UserConverter.toDtoList(data), total, page, limit);
  }

  async findById(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return UserConverter.toDto(user);
  }

  async delete(id: string) {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException('User not found');
    await this.userRepository.softDelete(id);
    return { message: 'User deleted' };
  }
}
