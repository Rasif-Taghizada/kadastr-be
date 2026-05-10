import { Controller, Delete, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import { UserEntity } from '@/database/entities/user.entity';
import { UserConverter } from '../converters/user.converter';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  getMe(@CurrentUser() user: UserEntity) {
    return UserConverter.toDto(user);
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.userService.findAll(query);
  }

  @Get(':id')
  findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.findById(id);
  }

  @Delete(':id')
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.delete(id);
  }
}
