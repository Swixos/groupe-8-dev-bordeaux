import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarbonRecord } from './carbon-record.entity';
import { CarbonController } from './carbon.controller';
import { CarbonService } from './carbon.service';
import { SiteModule } from '../site/site.module';

@Module({
  imports: [TypeOrmModule.forFeature([CarbonRecord]), SiteModule],
  controllers: [CarbonController],
  providers: [CarbonService],
  exports: [CarbonService],
})
export class CarbonModule {}
