import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'Email để nhận link đặt lại mật khẩu',
    example: 'user@example.com'
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
