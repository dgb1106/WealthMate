import { IsEmail, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PreferredGoal, PreferredMood } from '../../common/enums/enum';

export class UpdateUserDto {
  @ApiProperty({
    description: 'User name',
    example: 'John Doe',
    required: false
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
    required: false
  })
  @IsOptional()
  @IsString()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'User phone number',
    example: '+84123456789',
    required: false
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    description: 'City where the user lives',
    example: 'Ho Chi Minh City',
    required: false
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({
    description: 'District where the user lives',
    example: 'District 1',
    required: false
  })
  @IsOptional()
  @IsString()
  district?: string;

  @ApiProperty({
    description: 'User occupation',
    example: 'Software Engineer',
    required: false
  })
  @IsOptional()
  @IsString()
  job?: string;

  @ApiProperty({
    description: 'User preferred financial mood',
    enum: PreferredMood,
    example: 'IRRITATION',
    required: false
  })
  @IsOptional()
  @IsEnum(PreferredMood)
  preferred_mood?: PreferredMood;

  @ApiProperty({
    description: 'User preferred financial goal',
    enum: PreferredGoal,
    example: 'SAVING',
    required: false
  })
  @IsOptional()
  @IsEnum(PreferredGoal)
  preferred_goal?: PreferredGoal;
}