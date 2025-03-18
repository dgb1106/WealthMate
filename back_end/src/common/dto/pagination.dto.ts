import { IsNumber, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100) // Set reasonable maximum limit
  @Type(() => Number)
  limit?: number = 10;

  @IsOptional()
  includeDetails?: boolean = false;
}
