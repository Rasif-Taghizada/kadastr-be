import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '@/database/entities/user.entity';

@Injectable()
export class AuthRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
  ) {}

  findByEmail(email: string) {
    return this.repository.findOne({ where: { email } });
  }

  findByEmailWithPassword(email: string) {
    return this.repository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'firstName', 'lastName', 'role', 'isActive'],
    });
  }

  create(data: Partial<UserEntity>) {
    return this.repository.save(this.repository.create(data));
  }
}
