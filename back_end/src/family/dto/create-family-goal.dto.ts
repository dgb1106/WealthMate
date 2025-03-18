import { IsString, IsNumber, IsDate, IsOptional, Min, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFamilyGoalDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsNumber()
  @Min(0)
  target_amount: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  saved_amount?: number;

  @IsDate()
  @Type(() => Date)
  due_date: Date;
}
