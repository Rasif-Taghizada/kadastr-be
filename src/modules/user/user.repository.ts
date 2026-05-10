import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '@/database/entities/user.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
  ) {}

  findById(id: string) {
    return this.repository.findOne({ where: { id } });
  }

  findAll(skip: number, take: number) {
    return this.repository.findAndCount({ skip, take, order: { createdAt: 'DESC' } });
  }

  save(user: Partial<UserEntity>) {
    return this.repository.save(user);
  }

  softDelete(id: string) {
    return this.repository.softDelete(id);
  }
}
