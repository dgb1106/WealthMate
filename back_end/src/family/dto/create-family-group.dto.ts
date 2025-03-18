import { IsString, IsOptional, MaxLength, MinLength } from 'class-validator';

export class CreateFamilyGroupDto {
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  avatar_url?: string;
}
