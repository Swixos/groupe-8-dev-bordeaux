import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ReferenceService } from './reference.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/reference-data')
export class ReferenceController {
  constructor(private readonly referenceService: ReferenceService) {}

  @Get()
  async findAll() {
    return this.referenceService.findAll();
  }

  @Get(':category')
  async findByCategory(@Param('category') category: string) {
    return this.referenceService.findByCategory(category);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() body: { key: string; value: number; unit: string; category: string; label: string; description?: string }) {
    return this.referenceService.create(body);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: Partial<{ value: number; unit: string; category: string; label: string; description: string }>) {
    return this.referenceService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.referenceService.remove(id);
    return { message: 'Reference data deleted' };
  }
}
