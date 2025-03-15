import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Mật khẩu hiện tại',
    example: 'currentpassword123'
  })
  @IsNotEmpty()
  @IsString()
  currentPassword: string;

  @ApiProperty({
    description: 'Mật khẩu mới (tối thiểu 6 ký tự)',
    example: 'newpassword123'
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  newPassword: string;
}
