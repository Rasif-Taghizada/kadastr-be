import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { hashPassword, comparePassword } from '@/common/utils/hash.utils';
import { AuthRepository } from '../repositories/auth.repository';
import { TokenRepository } from '../repositories/token.repository';
import { JwtTokenService } from './jwt-token.service';
import { LoginDto, RegisterDto } from '../dto/auth.request.dto';
import { AuthResponseDto } from '../dto/auth.response.dto';
import { UserEntity } from '@/database/entities';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly tokenRepository: TokenRepository,
    private readonly jwtTokenService: JwtTokenService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const existing = await this.authRepository.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already in use');

    const user = await this.authRepository.create({
      ...dto,
      password: await hashPassword(dto.password),
    });

    return this.buildResponse(user);
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.authRepository.findByEmailWithPassword(dto.email);
    if (!user || !(await comparePassword(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.buildResponse(user);
  }

  async logout(token: string): Promise<void> {
    try {
      const payload = this.jwtTokenService.verify(token);
      await this.tokenRepository.revokeByJti(payload.jti);
    } catch {
      // Token already expired or invalid — nothing to revoke
    }
  }

  private async buildResponse(user: UserEntity): Promise<AuthResponseDto> {
    const { accessToken, jti, expiresAt } = this.jwtTokenService.sign(user);
    await this.tokenRepository.create({ jti, userId: user.id, expiresAt });
    return {
      accessToken,
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role },
    };
  }
}
