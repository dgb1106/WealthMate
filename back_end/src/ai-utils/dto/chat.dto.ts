import { IsNotEmpty, IsString, IsNumber, IsDateString, IsPositive, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ChatDto {
    @ApiProperty({
        description: 'Tâm trạng người dùng muốn',
        example: 'IRRITATION',
        maxLength: 255
    })
    @IsNotEmpty()
    @IsString()
    mood: string;

    @ApiProperty({
        description: 'Nội dung giao dịch',
        example: 'Ăn sáng 30k',
        maxLength: 255
    })
    @IsNotEmpty()
    @IsString()
    message: string;
}
