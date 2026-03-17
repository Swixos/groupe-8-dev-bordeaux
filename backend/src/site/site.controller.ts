import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { SiteService } from './site.service';
import { CreateSiteDto } from './dto/create-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/sites')
export class SiteController {
  constructor(private readonly siteService: SiteService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createSiteDto: CreateSiteDto, @Request() req: any) {
    return this.siteService.create(createSiteDto, req.user.userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Request() req: any) {
    return this.siteService.findByUser(req.user.userId);
  }

  @Get('user')
  @UseGuards(JwtAuthGuard)
  async findByUser(@Request() req: any) {
    return this.siteService.findByUser(req.user.userId);
  }

  @Post('compare')
  @UseGuards(JwtAuthGuard)
  async compareSites(@Body() body: { siteIds: number[] }) {
    return this.siteService.compareSites(body.siteIds);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.siteService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSiteDto: UpdateSiteDto,
    @Request() req: any,
  ) {
    return this.siteService.update(id, updateSiteDto, req.user.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    await this.siteService.remove(id, req.user.userId);
    return { message: 'Site deleted successfully' };
  }
}
