import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TokenDto {
  @ApiProperty({
    description: 'JWT token để làm mới',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  @IsNotEmpty()
  @IsString()
  token: string;
}
