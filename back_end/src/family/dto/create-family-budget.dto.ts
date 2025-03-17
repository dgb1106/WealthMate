import { IsString, IsNumber, IsDate, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFamilyBudgetDto {
  @IsString()
  categoryId: string;

  @IsNumber()
  @Min(0)
  limit_amount: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  spent_amount?: number;

  @IsDate()
  @Type(() => Date)
  start_date: Date;

  @IsDate()
  @Type(() => Date)
  end_date: Date;
}
