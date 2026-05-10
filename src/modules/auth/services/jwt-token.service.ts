import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { UserEntity } from '@/database/entities/user.entity';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class JwtTokenService {
  private readonly secret: string;
  private readonly expiresIn: string;

  constructor(private readonly configService: ConfigService) {
    this.secret = this.configService.get<string>('jwt.secret');
    this.expiresIn = this.configService.get<string>('jwt.expiresIn');
  }

  sign(user: Pick<UserEntity, 'id' | 'email' | 'role'>): string {
    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn as any });
  }

  verify(token: string): JwtPayload {
    return jwt.verify(token, this.secret) as JwtPayload;
  }
}
