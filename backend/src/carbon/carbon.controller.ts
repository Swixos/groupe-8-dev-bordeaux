import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { CarbonService } from './carbon.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api')
export class CarbonController {
  constructor(private readonly carbonService: CarbonService) {}

  @Get('materials')
  getMaterials() {
    return this.carbonService.getMaterials();
  }

  @Post('sites/:id/calculate')
  @UseGuards(JwtAuthGuard)
  async calculate(@Param('id', ParseIntPipe) id: number) {
    return this.carbonService.calculate(id);
  }

  @Get('sites/:id/history')
  @UseGuards(JwtAuthGuard)
  async getHistory(@Param('id', ParseIntPipe) id: number) {
    return this.carbonService.getHistory(id);
  }
}
