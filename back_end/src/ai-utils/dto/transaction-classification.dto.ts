import { Transaction } from './../../../../front_end/app/types/transaction';
import { IsNotEmpty, IsString, IsNumber, IsDateString, IsPositive, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class TransactionClassificationDto {
    @ApiProperty({
        description: 'Mô tả về giao dịch được phân loại',
        example: 'Mua quần áo tại Uniqlo 400k',
        maxLength: 255
    })
    @IsNotEmpty()
    @IsString()
    prompt: string;
}