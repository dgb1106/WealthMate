import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { LoanRepository } from './repositories/loans-repository.interface';
import { CreateLoanDto } from './dto/create-loans.dto';
import { UpdateLoanDto } from './dto/update-loans.dto';
import { LoanDomainService } from './services/loan-domain.service';
import { LoanStatus } from '../common/enums/enum';

@Injectable()
export class LoansService {
  constructor(
    private readonly loanRepository: LoanRepository,
    private readonly loanDomainService: LoanDomainService
  ) {}

  async createLoan(userId: string, createLoanDto: CreateLoanDto): Promise<any> {
    try {
      // Kiểm tra thời gian hợp lệ
      const dueDate = new Date(createLoanDto.due_date);
      const today = new Date();
      
      if (dueDate <= today) {
        throw new BadRequestException('Ngày đáo hạn phải là ngày trong tương lai');
      }
      
      // Sử dụng repository để tạo khoản vay
      const loan = await this.loanRepository.create(userId, createLoanDto);
      
      // Trả về response format
      return loan.toResponseFormat();
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Không thể tạo khoản vay: ' + error.message);
    }
  }

  async getLoans(userId: string): Promise<any[]> {
    const loans = await this.loanRepository.findAll(userId);
    return loans.map(loan => loan.toResponseFormat());
  }

  async getLoanById(userId: string, loanId: string): Promise<any> {
    const loan = await this.loanRepository.findById(userId, loanId);
    
    if (!loan) {
      throw new NotFoundException(`Khoản vay với ID ${loanId} không tồn tại`);
    }
    
    return loan.toResponseFormat();
  }

  async getActiveLoans(userId: string): Promise<any[]> {
    const loans = await this.loanRepository.findByStatus(userId, LoanStatus.ACTIVE);
    return loans.map(loan => loan.toResponseFormat());
  }

  async getUpcomingDueLoans(userId: string, daysThreshold: number = 30): Promise<any[]> {
    const loans = await this.loanRepository.findUpcomingDueLoans(userId, daysThreshold);
    return loans.map(loan => loan.toResponseFormat());
  }

  async updateLoan(userId: string, loanId: string, updateLoanDto: UpdateLoanDto): Promise<any> {
    try {
      // Kiểm tra thời gian hợp lệ nếu due_date được cung cấp
      if (updateLoanDto.due_date) {
        const dueDate = new Date(updateLoanDto.due_date);
        const today = new Date();
        
        if (dueDate <= today) {
          throw new BadRequestException('Ngày đáo hạn phải là ngày trong tương lai');
        }
      }
      
      // Cập nhật khoản vay
      const loan = await this.loanRepository.update(userId, loanId, updateLoanDto);
      return loan.toResponseFormat();
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Không thể cập nhật khoản vay: ' + error.message);
    }
  }

  async makePayment(userId: string, loanId: string, amount: number): Promise<any> {
    try {
      // Sử dụng domain service để thanh toán và cập nhật số dư
      const result = await this.loanDomainService.makePaymentWithBalanceUpdate(userId, loanId, amount);
      
      return {
        ...result.loan.toResponseFormat(),
        updatedBalance: result.updatedBalance
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Không thể thanh toán khoản vay: ' + error.message);
    }
  }

  async deleteLoan(userId: string, loanId: string): Promise<{ success: boolean, message: string }> {
    try {
      await this.loanRepository.delete(userId, loanId);
      return { success: true, message: 'Khoản vay đã được xóa thành công' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Không thể xóa khoản vay: ' + error.message);
    }
  }

  async getOverdueLoans(userId: string): Promise<any[]> {
    const loans = await this.loanRepository.findOverdueLoans(userId);
    return loans.map(loan => loan.toResponseFormat());
  }

  async getLoanSummary(userId: string) {
    return this.loanRepository.getLoanSummary(userId);
  }
  
  // Thêm các phương thức mới sử dụng domain service
  
  async getRepaymentPlan(userId: string, loanId: string): Promise<any[]> {
    try {
      return await this.loanDomainService.generateRepaymentPlan(userId, loanId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Không thể tạo kế hoạch trả nợ: ' + error.message);
    }
  }
  
  async analyzeLoanPortfolio(userId: string): Promise<any> {
    try {
      return await this.loanDomainService.analyzeLoanPortfolio(userId);
    } catch (error) {
      throw new BadRequestException('Không thể phân tích danh mục khoản vay: ' + error.message);
    }
  }
  
  async calculatePrepaymentSavings(userId: string, loanId: string, amount: number): Promise<any> {
    try {
      return await this.loanDomainService.calculatePrepaymentSavings(userId, loanId, amount);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Không thể tính toán tiết kiệm khi trả trước: ' + error.message);
    }
  }
}
