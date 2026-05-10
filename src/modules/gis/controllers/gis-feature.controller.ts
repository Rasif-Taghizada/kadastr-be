import { Controller, Get, Post, Delete, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { GisFeatureService } from '../services/gis-feature.service';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { UserEntity } from '@/database/entities';
import { ROUTES } from '@/constants/routes';
import { SaveFeaturesDto, UploadFeaturesDto, DeleteFeaturesDto } from '../dto/gis-feature.request.dto';

@Controller(ROUTES.GIS)
export class GisFeatureController {
  constructor(private readonly gisFeatureService: GisFeatureService) {}

  @Get('features')
  findAll() {
    return this.gisFeatureService.findAll();
  }

  @Post('features/save')
  save(@Body() dto: SaveFeaturesDto, @CurrentUser() user: UserEntity) {
    return this.gisFeatureService.saveFeatures(dto, user.id);
  }

  @Post('features/upload')
  upload(@Body() dto: UploadFeaturesDto, @CurrentUser() user: UserEntity) {
    return this.gisFeatureService.uploadFeatures(dto, user.id);
  }

  @Delete('features/batch')
  deleteBatch(@Body() dto: DeleteFeaturesDto) {
    return this.gisFeatureService.deleteByIds(dto.ids);
  }

  @Delete('features/:id')
  deleteById(@Param('id', ParseUUIDPipe) id: string) {
    return this.gisFeatureService.deleteById(id);
  }
}
