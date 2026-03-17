import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  IsEnum,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MaterialType } from '../site-material.entity';

export class UpdateMaterialDto {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsEnum(MaterialType)
  materialType: MaterialType;

  @IsNumber()
  @Min(0)
  quantity: number;
}

export class UpdateSiteDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  surfaceArea?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  parkingSpaces?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  energyConsumption?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  employeeCount?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  workstationCount?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateMaterialDto)
  @IsOptional()
  materials?: UpdateMaterialDto[];
}
