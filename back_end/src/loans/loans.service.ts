import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionService } from '../transactions/transactions.service';
import { CreateLoanDto } from './dto/create-loans.dto';
import { UpdateLoanDto } from './dto/update-loans.dto';
import { PayLoanDto } from './dto/pay-loan.dto';
import { LoanRepository } from './repositories/loans-repository.interface';
import { LoanStatus } from '../common/enums/enum';
import { Loan } from './entities/loans.entity';

@Injectable()
export class LoansService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly transactionService: TransactionService,
    @Inject('LoanRepository') private readonly loanRepository: LoanRepository
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

  async makePayment(userId: string, loanId: string, payLoanDto: PayLoanDto) {
    // Kiểm tra xem khoản vay có tồn tại không
    const loan = await this.loanRepository.findById(userId, loanId);

    if (!loan) {
      throw new NotFoundException(`Không tìm thấy khoản vay với ID ${loanId}`);
    }

    // Kiểm tra số tiền thanh toán
    const paymentAmount = payLoanDto.amount;
    if (paymentAmount <= 0) {
      throw new BadRequestException('Số tiền thanh toán phải lớn hơn 0');
    }

    // Lấy thông tin người dùng để kiểm tra số dư
    const user = await this.prisma.users.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException(`Không tìm thấy người dùng với ID ${userId}`);
    }

    // Kiểm tra số dư
    if (Number(user.current_balance) < paymentAmount) {
      throw new BadRequestException(`Số dư không đủ để thanh toán. Số dư hiện tại: ${user.current_balance}, Cần thanh toán: ${paymentAmount}`);
    }

    return this.prisma.$transaction(async (prisma) => {
      try {
        // Tạo transaction thanh toán khoản vay (danh mục "trả nợ" có ID = 16)
        const transaction = await this.transactionService.createTransaction(userId, {
          categoryId: '16', // ID của danh mục "trả nợ"
          amount: paymentAmount,
          description: `Thanh toán khoản vay: ${loan.name || 'Khoản vay #' + loanId}`
        });

        // Cập nhật thông tin khoản vay
        let remainingAmount = 0;
        if (loan.remaining_amount) {
          remainingAmount = Number(loan.remaining_amount) - paymentAmount;
        } else if (loan.remaining_principal) {
          remainingAmount = Number(loan.remaining_principal) - paymentAmount;
        }
        
        // Cập nhật khoản vay
        const updatedLoan = await prisma.loans.update({
          where: { id: BigInt(loanId) },
          data: {
            remaining_amount: remainingAmount > 0 ? remainingAmount : 0,
            status: remainingAmount <= 0 ? LoanStatus.PAID : loan.status,
          }
        });

        return {
          loan: updatedLoan,
          transaction: transaction,
          message: 'Thanh toán khoản vay thành công',
          newBalance: transaction.newBalance
        };
      } catch (error) {
        if (error instanceof BadRequestException || error instanceof NotFoundException) {
          throw error;
        }
        throw new InternalServerErrorException(`Lỗi khi thanh toán khoản vay: ${error.message}`);
      }
    });
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
  
  async getRepaymentPlan(userId: string, loanId: string): Promise<any[]> {
    try {
      return await this.generateRepaymentPlan(userId, loanId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Không thể tạo kế hoạch trả nợ: ' + error.message);
    }
  }
  
  /**
   * Phân tích và đưa ra kế hoạch trả nợ
   */
  async generateRepaymentPlan(userId: string, loanId: string): Promise<any[]> {
    const loan = await this.loanRepository.findById(userId, loanId);
    
    if (!loan) {
      throw new NotFoundException(`Khoản nợ với ID ${loanId} không tồn tại`);
    }
    
    if (loan.isPaid()) {
      return []; // Trả về kế hoạch trống nếu đã thanh toán hết
    }
    
    const loanEntity = new Loan(loan);
    const monthlyPayment = loan.monthly_payment || loanEntity.calculateRequiredMonthlyPayment();
    const monthlyInterestRate = loan.interest_rate / 100 / 12;
    
    // Tạo kế hoạch trả nợ
    const repaymentPlan: {
      payment_date: Date;
      payment_amount: number;
      principal_payment: number;
      interest_payment: number;
      remaining_principal: number;
    }[] = [];
    let remainingPrincipal = loan.remaining_amount;
    let paymentDate = new Date();
    
    while (remainingPrincipal > 0) {
      // Tính toán lãi hàng tháng
      const interestPayment = remainingPrincipal * monthlyInterestRate;
      
      // Tính toán gốc hàng tháng
      let principalPayment = monthlyPayment - interestPayment;
      
      // Điều chỉnh thanh toán cuối cùng
      if (principalPayment > remainingPrincipal) {
        principalPayment = remainingPrincipal;
      }
      
      // Cập nhật số tiền gốc còn lại
      remainingPrincipal -= principalPayment;
      
      // Thêm vào kế hoạch
      repaymentPlan.push({
        payment_date: new Date(paymentDate),
        payment_amount: principalPayment + interestPayment,
        principal_payment: principalPayment,
        interest_payment: interestPayment,
        remaining_principal: remainingPrincipal
      });
      
      // Tăng ngày thanh toán thêm 1 tháng
      paymentDate.setMonth(paymentDate.getMonth() + 1);
      
      // Tránh vòng lặp vô hạn nếu không giảm được nợ
      if (principalPayment <= 0) break;
    }
    
    return repaymentPlan;
  }

  /**
   * Phân tích danh mục khoản vay của người dùng và đưa ra đề xuất
   */
  async analyzeLoanPortfolio(userId: string): Promise<any> {
    const loans = await this.loanRepository.findAll(userId);
    
    if (loans.length === 0) {
      return {
        total_debt: 0,
        monthly_payment: 0,
        debt_to_payment_ratio: 0,
        high_interest_loans: [],
        recommendations: ['Bạn không có khoản vay nào.']
      };
    }
    
    // Tính tổng nợ và thanh toán hàng tháng
    const totalDebt = loans.reduce((sum, loan) => sum + loan.remaining_amount, 0);
    const monthlyPayment = loans.reduce((sum, loan) => {
      return sum + (loan.monthly_payment || loan.calculateRequiredMonthlyPayment());
    }, 0);
    
    // Tìm các khoản vay lãi suất cao (trên 10%)
    const highInterestLoans = loans
      .filter(loan => loan.interest_rate > 10 && loan.isActive())
      .map(loan => ({ id: loan.id, name: loan.name, interest_rate: loan.interest_rate }));
    
    // Sắp xếp khoản vay theo lãi suất để ưu tiên trả
    const paymentPriority = loans
      .filter(loan => loan.isActive())
      .sort((a, b) => b.interest_rate - a.interest_rate)
      .map(loan => ({
        id: loan.id,
        name: loan.name,
        interest_rate: loan.interest_rate,
        monthly_interest: loan.calculateMonthlyInterest()
      }));
    
    // Tạo các đề xuất
    const recommendations: string[] = [];
    
    if (highInterestLoans.length > 0) {
      recommendations.push('Ưu tiên thanh toán các khoản vay có lãi suất cao để tiết kiệm tiền lãi.');
    }
    
    if (paymentPriority.length > 0) {
      recommendations.push(`Thứ tự thanh toán được đề xuất: ${paymentPriority.map(loan => loan.name).join(', ')}.`);
    }
    
    // Tính tỷ lệ nợ so với thu nhập (giả định)
    const debtToPaymentRatio = monthlyPayment > 0 ? (totalDebt / monthlyPayment).toFixed(1) : 0;
    
    return {
      total_debt: Math.round(totalDebt * 100) / 100,
      monthly_payment: Math.round(monthlyPayment * 100) / 100,
      debt_to_payment_ratio: debtToPaymentRatio,
      high_interest_loans: highInterestLoans,
      payment_priority: paymentPriority,
      recommendations: recommendations.length > 0 ? recommendations : ['Các khoản vay của bạn đang ở mức quản lý được.']
    };
  }
  
  /**
   * Tính toán số tiền lãi tiết kiệm được khi trả trước khoản vay
   */
  async calculatePrepaymentSavings(userId: string, loanId: string, extraPayment: number): Promise<any> {
    const loan = await this.loanRepository.findById(userId, loanId);
    
    if (!loan) {
      throw new NotFoundException(`Khoản nợ với ID ${loanId} không tồn tại`);
    }
    
    if (loan.isPaid() || !loan.isActive()) {
      throw new BadRequestException('Khoản vay này không thể trả trước');
    }
    
    if (extraPayment <= 0) {
      throw new BadRequestException('Số tiền trả trước phải lớn hơn 0');
    }
    
    // Tính toán kế hoạch trả nợ hiện tại
    const standardPlan = await this.generateRepaymentPlan(userId, loanId);
    
    // Tính toán tổng lãi phải trả theo kế hoạch tiêu chuẩn
    const totalStandardInterest = standardPlan.reduce((sum, payment) => 
      sum + payment.interest_payment, 0
    );
    
    // Tính toán kế hoạch trả nợ với khoản trả trước
    const loanEntity = new Loan(loan);
    const updatedLoan = new Loan({
      ...loan,
      remaining_amount: Math.max(0, loan.remaining_amount - extraPayment)
    });
    
    // Tính toán lại kế hoạch trả nợ sau khi trả trước
    const monthlyPayment = updatedLoan.monthly_payment || updatedLoan.calculateRequiredMonthlyPayment();
    const monthlyInterestRate = updatedLoan.interest_rate / 100 / 12;
    
    let remainingPrincipal = updatedLoan.remaining_amount;
    let paymentDate = new Date();
    let totalPrepaymentInterest = 0;
    let timeShortened = 0;
    
    while (remainingPrincipal > 0) {
      const interestPayment = remainingPrincipal * monthlyInterestRate;
      let principalPayment = monthlyPayment - interestPayment;
      
      if (principalPayment > remainingPrincipal) {
        principalPayment = remainingPrincipal;
      }
      
      remainingPrincipal -= principalPayment;
      totalPrepaymentInterest += interestPayment;
      
      timeShortened++;
      
      if (principalPayment <= 0) break;
    }
    
    // Tính khoản tiết kiệm
    const interestSavings = totalStandardInterest - totalPrepaymentInterest;
    const timeMonthsSaved = standardPlan.length - timeShortened;
    
    return {
      loan_id: loanId,
      extra_payment: extraPayment,
      total_interest_standard: Math.round(totalStandardInterest * 100) / 100,
      total_interest_with_prepayment: Math.round(totalPrepaymentInterest * 100) / 100,
      interest_savings: Math.round(interestSavings * 100) / 100,
      time_saved_months: timeMonthsSaved,
      original_payments: standardPlan.length,
      new_payments_count: timeShortened
    };
  }
}
