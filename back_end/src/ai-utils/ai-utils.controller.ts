import { Controller, Get, Post, Body, UseInterceptors, UploadedFile, Request, Query } from '@nestjs/common';
import { AiUtilsService } from './ai-utils.service';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';

@ApiTags('ai-utils')
@Controller('ai-utils')
export class AiUtilsController {
    constructor(private readonly aiUtilsService: AiUtilsService) {}

    @Get('expense-forecast')
    @ApiOperation({ summary: 'Lấy dự báo chi tiêu' })
    @ApiResponse({ status: 200, description: 'Dự báo chi tiêu.' })
    @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ.' })
    @ApiResponse({ status: 500, description: 'Lỗi server.' })
    async getExpenseForecast(
        @Query('income') income: string,
        @Query('interestRate') interestRate: string,
        @Query('inflationRate') inflationRate: string,
        @Query('holidays') holidays: string
    ) {
        const incomeNum = parseFloat(income);
        const interestRateNum = parseFloat(interestRate);
        const inflationRateNum = parseFloat(inflationRate);
        const holidaysNum = parseInt(holidays);
        
        return this.aiUtilsService.getExpenseForecast(
            incomeNum, interestRateNum, inflationRateNum, holidaysNum
        );
    }

    @Post('transaction-classification')
    @ApiOperation({ summary: 'Phân loại giao dịch' })
    @ApiResponse({ status: 200, description: 'Phân loại được giao dịch.' })
    @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ.' })
    @ApiResponse({ status: 500, description: 'Lỗi server.' })
    async getTransactionClassification(
        @Body('prompt') prompt: string
    ) {
        return this.aiUtilsService.getTransactionClassification(prompt);
    }

    @Post('chat')
    @ApiOperation({ summary: 'Nhận phản hồi từ chatbot' })
    @ApiResponse({ status: 200, description: 'Phản hồi từ chatbot.' })
    @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ.' })
    @ApiResponse({ status: 500, description: 'Lỗi server.' })
    async getChatResponse(
        @Body('mood') mood: string,
        @Body('message') message: string
    ) {
        return this.aiUtilsService.getChatResponse(mood, message);
    }

    @Post('speech-to-text')
    @ApiOperation({ summary: 'Nhận văn bản từ file âm thanh' })
    @ApiResponse({ status: 200, description: 'Văn bản từ file âm thanh.' })
    @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ.' })
    @ApiResponse({ status: 500, description: 'Lỗi server.' })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('file'))
    async getTranscriptionFromSpeech(@UploadedFile() audioFile: Express.Multer.File) {
        return this.aiUtilsService.getTranscriptionFromSpeech(audioFile.buffer);
    }

    @Post('image-to-transaction')
    @ApiOperation({ summary: 'Nhận giao dịch từ file ảnh' })
    @ApiResponse({ status: 200, description: 'Giao dịch từ file ảnh.' })
    @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ.' })
    @ApiResponse({ status: 500, description: 'Lỗi server.' })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('file'))
    async getTransactionFromImage(@UploadedFile() imageFile: Express.Multer.File) {
        return this.aiUtilsService.scanBill(imageFile.buffer);
    }

    @Get('budget-suggestion')
    @ApiOperation({ summary: 'Nhận gợi ý ngân sách' })
    @ApiResponse({ status: 200, description: 'Gợi ý ngân sách.' })
    @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ.' })
    async getBudgetSuggestion(@Query('income') income: number) {
        return this.aiUtilsService.getBudgetSuggestion(income);
    }
}
