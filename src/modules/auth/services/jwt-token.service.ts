import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { UserEntity } from '@/database/entities/user.entity';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  jti: string;
}

export interface SignedToken {
  accessToken: string;
  jti: string;
  expiresAt: Date;
}

@Injectable()
export class JwtTokenService {
  private readonly secret: string;
  private readonly expiresIn: string;

  constructor(private readonly configService: ConfigService) {
    this.secret = this.configService.get<string>('jwt.secret');
    this.expiresIn = this.configService.get<string>('jwt.expiresIn');
  }

  sign(user: Pick<UserEntity, 'id' | 'email' | 'role'>): SignedToken {
    const jti = uuidv4();
    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role, jti };
    const accessToken = jwt.sign(payload, this.secret, { expiresIn: this.expiresIn as any });
    const decoded = jwt.decode(accessToken) as { exp: number };
    const expiresAt = new Date(decoded.exp * 1000);
    return { accessToken, jti, expiresAt };
  }

  verify(token: string): JwtPayload {
    return jwt.verify(token, this.secret) as JwtPayload;
  }
}
