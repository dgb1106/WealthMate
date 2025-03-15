import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AiUtilsService {
    private baseUrl: string;

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        this.baseUrl = this.configService.get('https://wealthmate-ai-services.onrender.com') || 'AI_SERVICES_BASE_URL';
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

    async getTransactionClassification(transaction: string): Promise<string> {
        try {
            const response = await firstValueFrom(
                this.httpService.post(`${this.baseUrl}/transaction_classification`, {
                    'Transaction': transaction,
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

    async getTranscriptionFromSpeech(audioFile: Buffer): Promise<string> {
        try {
            const formData = new FormData();
            const blob = new Blob([audioFile], { type: 'audio/wav' });
            formData.append('audio', blob, 'audio.wav');
            const response = await firstValueFrom(
                this.httpService.post(`${this.baseUrl}/speech_to_text`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',

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
                    'Income (VND)': income,
                })
            );
            return response.data;
        } catch (error) {
            throw new HttpException(`Failed to get budget suggestion: ${error.message}`, 500);
        }
    }

    async scanBill(imageFile: Buffer) {
        try {
            const formData = new FormData();
            const blob = new Blob([imageFile], { type: 'image/jpeg' });
            formData.append('image', blob, 'bill.jpg');
            const response = await firstValueFrom(
                this.httpService.post(`${this.baseUrl}/scan_bill`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                })
            );
            return response.data;
        } catch (error) {
            throw new HttpException(`Failed to scan bill: ${error.message}`, 500);
        }
    }
}
