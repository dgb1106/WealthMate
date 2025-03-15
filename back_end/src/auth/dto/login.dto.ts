import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class LoginDto {
    
  @ApiProperty({
    description: 'Email address',
    example: 'example@email.com'
  })
  @IsEmail({}, { message: 'Please provide a valid email' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    description: 'Password',
    example: 'StrongP@ssw0rd'
  })
  @IsString()
    @IsNotEmpty({ message: 'Password is required' })
  password: string;
}