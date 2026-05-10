import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LoginDto, RegisterDto } from '../dto/auth.request.dto';
import { Public } from '@/common/decorators/public.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { UserEntity } from '@/database/entities';
import { UserConverter } from '@/modules/user/converters/user.converter';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('logout')
  async logout(@Headers('authorization') authHeader: string) {
    const token = authHeader?.split(' ')[1];
    await this.authService.logout(token ?? '');
    return { message: 'Logged out successfully' };
  }

  @Get('me')
  getMe(@CurrentUser() user: UserEntity) {
    return UserConverter.toDto(user);
  }
}
