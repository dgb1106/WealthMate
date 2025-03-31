import { CreateTransactionDto } from './../transactions/dto/create-transaction.dto';
import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { get } from 'http';

@Injectable()
export class AiUtilsService {
    private baseUrl: string;

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        // this.baseUrl = this.configService.get('AI_UTILS_BASE_URL') || 'https://wealthmate-ai-services.onrender.com';
        // this.baseUrl = 'https://wealthmate-ai-services.onrender.com';
        // this.baseUrl = 'http://127.0.0.1:5000';
        this.baseUrl = `${process.env.AI_UTILS_ONLINE_URL}`;
    }

    async getExpenseForecast(income: number, interestRate: number, inflationRate: number, holidays: number): Promise<number> {
        try {
            const response = await firstValueFrom(
                this.httpService.post<{ forecasted_expense: number }>(`${this.baseUrl}/monthly_expense_prediction`, {
                    'Income (VND)': income,
                    'Interest rate (%)': interestRate,
                    'Inflation rate (%)': inflationRate,
                    'Holidays': holidays,
                })
            );
            return response.data.forecasted_expense;
        } catch (error) {
            throw new HttpException(`Failed to get expense forecast: ${error.message}`, 500);
        }
    }

    async getTransactionClassification(message: string): Promise<string> {
        try {
            const response = await firstValueFrom(
                this.httpService.post(`${this.baseUrl}/transaction_classification`, {
                    'prompt': message,
                })
            );
            return response.data;
        } catch (error) {
            throw new HttpException(`Failed to get transaction classification: ${error.message}`, 500);
        }
    }

    async getChatResponse(mood: string, prompt: string): Promise<string> {
        try {
            const response = await firstValueFrom(
                this.httpService.post(`${this.baseUrl}/chat`, {
                    'mood': mood,
                    'prompt': prompt
                })
            );
            return response.data;
        } catch (error) {
            throw new HttpException(`Failed to get chat response: ${error.message}`, 500);
        }
    }

    async getTranscriptionFromSpeech(audioFile: Buffer, mood: string): Promise<string> {
        try {
            const FormData = require('form-data');
            const formData = new FormData();
            formData.append('file', audioFile, {
                filename: 'audio.wav',
                contentType: 'audio/wav',
            });
            formData.append('mood', mood);
            const response = await firstValueFrom(
                this.httpService.post(`${this.baseUrl}/speech_transcribe`, formData, {
                    timeout: 30000,
                    headers: {
                        ...formData.getHeaders(),
                    }
                })
            );
            return response.data;
        } catch (error) {
            throw new HttpException(`Failed to get transcription from speech: ${error.message}`, 500);
        }
    }

    async getBudgetSuggestion(income: number) {
        try {
            const response = await firstValueFrom(
                this.httpService.post(`${this.baseUrl}/suggest_budget`, {
                    'income': income,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
                )
            );
            return response.data;
        } catch (error) {
            throw new HttpException(`Failed to get budget suggestion: ${error.message}`, 500);
        }
    }

    async scanBill(imageFile: Buffer, mood: string) {
        try {
            const FormData = require('form-data');
            const formData = new FormData();
            formData.append('file', imageFile, {
                filename: 'bill.jpeg',
                contentType: 'image/jpeg',
            });
            formData.append('mood', mood);
            const response = await firstValueFrom(
                this.httpService.post(`${this.baseUrl}/scan_bills`, formData, {
                    timeout: 30000,
                    headers: {
                        ...formData.getHeaders(),
                    }
                })
            );
            return response.data;
        } catch (error) {
            throw new HttpException(`Failed to scan bill: ${error.message}`, 500);
        }
    }
}
