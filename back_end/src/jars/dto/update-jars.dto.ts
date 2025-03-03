import { IsEnum, IsOptional, IsNumber, IsString, MaxLength, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { JarType } from '../../common/enums/enum';

export class UpdateJarDto {
  @ApiProperty({
    description: 'Name of the jar',
    example: 'Necessities',
    maxLength: 255,
    required: false
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiProperty({
    description: 'Maximum amount to be stored in this jar',
    example: 5000.00,
    minimum: 0,
    required: false
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  @Min(0)
  limit_amount?: number;

  @ApiProperty({
    description: 'Type of the jar',
    enum: JarType,
    example: 'NECESSITY',
    required: false
  })
  @IsOptional()
  @IsEnum(JarType)
  type?: JarType;

  @ApiProperty({
    description: 'Percentage of income to allocate to this jar',
    example: 55.00,
    minimum: 0,
    maximum: 100,
    required: false
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  @Min(0)
  @Max(100)
  allocation_percentage?: number;
}