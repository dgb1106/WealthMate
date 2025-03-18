import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MaxLength, MinLength } from 'class-validator';

export class CreateFamilyGroupDto {
  @ApiProperty({
    description: 'The name of the family group',
    example: 'Smith Family',
    required: true,
    maxLength: 100,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Description of the family group',
    example: 'Our family budget planning group',
    required: false,
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({
    description: 'URL to the family group avatar/image',
    example: 'https://example.com/family-avatar.png',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  avatar_url?: string;
}
