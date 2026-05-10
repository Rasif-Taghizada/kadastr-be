import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TokenEntity } from '@/database/entities';

@Injectable()
export class TokenRepository {
  constructor(
    @InjectRepository(TokenEntity)
    private readonly repository: Repository<TokenEntity>,
  ) {}

  create(data: { jti: string; userId: string; expiresAt: Date }): Promise<TokenEntity> {
    return this.repository.save(this.repository.create({ ...data, revokedAt: null }));
  }

  findActiveByJti(jti: string): Promise<TokenEntity | null> {
    return this.repository.findOne({
      where: { jti },
    });
  }

  async revokeByJti(jti: string): Promise<void> {
    await this.repository.update({ jti }, { revokedAt: new Date() });
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .update(TokenEntity)
      .set({ revokedAt: new Date() })
      .where('user_id = :userId AND revoked_at IS NULL', { userId })
      .execute();
  }

  async deleteExpired(): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .delete()
      .where('expires_at < NOW()')
      .execute();
  }
}
