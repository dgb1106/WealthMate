import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Loan } from './entities/loans.entity';
import { LoanStatus } from '../common/enums/enum';
import { CreateLoanDto } from './dto/create-loans.dto';
import { UpdateLoanDto } from './dto/update-loans.dto';

@Injectable()
export class LoansService {
  constructor(private readonly prisma: PrismaService) {}

  async createLoan(userId: string, createLoanDto: CreateLoanDto): Promise<Loan> {
    try {
      // Kiểm tra xem người dùng có tồn tại không
      const user = await this.prisma.users.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException(`Người dùng với ID ${userId} không tồn tại`);
      }

      // Tạo khoản nợ mới
      const loan = await this.prisma.loans.create({
        data: {
          userId,
          name: createLoanDto.name,
          due_date: new Date(createLoanDto.due_date),
          created_at: new Date(),
          total_amount: createLoanDto.total_amount,
          remaining_amount: createLoanDto.total_amount, // Ban đầu, số tiền còn lại bằng tổng số tiền
          status: LoanStatus.ACTIVE,
          interest_rate: createLoanDto.interest_rate,
          monthly_payment: createLoanDto.monthly_payment,
          description: createLoanDto.description || '',
        },
      });

      return new Loan(loan);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Không thể tạo khoản nợ');
    }
  }

  async getLoans(userId: string): Promise<Loan[]> {
    const loans = await this.prisma.loans.findMany({
      where: { userId },
    });

    return loans.map(loan => new Loan(loan));
  }

  async getLoanById(userId: string, loanId: string): Promise<Loan> {
    const loan = await this.prisma.loans.findFirst({
      where: {
        id: Number(loanId),
        userId,
      },
    });

    if (!loan) {
      throw new NotFoundException(`Khoản nợ với ID ${loanId} không tồn tại`);
    }

    return new Loan(loan);
  }

  async getActiveLoans(userId: string): Promise<Loan[]> {
    const loans = await this.prisma.loans.findMany({
      where: {
        userId,
        status: LoanStatus.ACTIVE,
      },
    });

    return loans.map(loan => new Loan(loan));
  }

  async getUpcomingDueLoans(userId: string, daysThreshold: number = 30): Promise<Loan[]> {
    const today = new Date();
    const thresholdDate = new Date();
    thresholdDate.setDate(today.getDate() + daysThreshold);

    const loans = await this.prisma.loans.findMany({
      where: {
        userId,
        status: LoanStatus.ACTIVE,
        due_date: {
          gte: today,
          lte: thresholdDate,
        },
      },
    });

    return loans.map(loan => new Loan(loan));
  }

  async updateLoan(userId: string, loanId: string, updateLoanDto: UpdateLoanDto): Promise<Loan> {
    // Kiểm tra xem khoản nợ có tồn tại không
    const existingLoan = await this.prisma.loans.findFirst({
      where: {
        id: Number(loanId),
        userId,
      },
    });

    if (!existingLoan) {
      throw new NotFoundException(`Khoản nợ với ID ${loanId} không tồn tại`);
    }

    // Cập nhật khoản nợ
    const updatedLoan = await this.prisma.loans.update({
      where: { id: Number(loanId) },
      data: {
        ...(updateLoanDto.name && { name: updateLoanDto.name }),
        ...(updateLoanDto.due_date && { due_date: new Date(updateLoanDto.due_date) }),
        ...(updateLoanDto.total_amount !== undefined && { total_amount: Number(updateLoanDto.total_amount) }),
        ...(updateLoanDto.remaining_amount !== undefined && { remaining_amount: updateLoanDto.remaining_amount }),
        ...(updateLoanDto.status && { status: updateLoanDto.status }),
        ...(updateLoanDto.interest_rate !== undefined && { interest_rate: updateLoanDto.interest_rate }),
        ...(updateLoanDto.monthly_payment !== undefined && { monthly_payment: Number(updateLoanDto.monthly_payment) }),
        ...(updateLoanDto.description !== undefined && { description: updateLoanDto.description }),
      },
    });

    return new Loan(updatedLoan);
  }

  async makePayment(userId: string, loanId: string, amount: number): Promise<Loan> {
    // Kiểm tra xem khoản nợ có tồn tại không
    const loan = await this.prisma.loans.findFirst({
      where: {
        id: Number(loanId),
        userId,
      },
    });

    if (!loan) {
      throw new NotFoundException(`Khoản nợ với ID ${loanId} không tồn tại`);
    }

    if (loan.status === LoanStatus.PAID) {
      throw new BadRequestException('Khoản nợ này đã được trả hết');
    }

    // Tính toán số tiền còn lại sau khi thanh toán
    const newRemainingAmount = Math.max(0, Number(loan.remaining_amount) - amount);
    
    // Cập nhật trạng thái nếu đã trả hết
    const newStatus = newRemainingAmount === 0 ? LoanStatus.PAID : loan.status;

    // Cập nhật khoản nợ
    const updatedLoan = await this.prisma.loans.update({
      where: { id: Number(loanId) },
      data: {
        remaining_amount: newRemainingAmount,
        status: newStatus,
      },
    });

    return new Loan(updatedLoan);
  }

  async deleteLoan(userId: string, loanId: string): Promise<void> {
    // Kiểm tra xem khoản nợ có tồn tại không
    const loan = await this.prisma.loans.findFirst({
      where: {
        id: Number(loanId),
        userId,
      },
    });

    if (!loan) {
      throw new NotFoundException(`Khoản nợ với ID ${loanId} không tồn tại`);
    }

    // Xóa khoản nợ
    await this.prisma.loans.delete({
      where: { id: Number(loanId) },
    });
  }

  async getOverdueLoans(userId: string): Promise<Loan[]> {
    const today = new Date();

    const loans = await this.prisma.loans.findMany({
      where: {
        userId,
        status: LoanStatus.ACTIVE,
        due_date: {
          lt: today,
        },
      },
    });

    return loans.map(loan => new Loan(loan));
  }

  async getLoanSummary(userId: string) {
    const loans = await this.prisma.loans.findMany({
      where: { userId },
    });

    const totalLoans = loans.length;
    const activeLoans = loans.filter(loan => loan.status === LoanStatus.ACTIVE).length;
    const totalDebt = loans.reduce((sum, loan) => sum + Number(loan.remaining_amount), 0);
    const overdueLoans = loans.filter(loan => 
      loan.status === LoanStatus.ACTIVE && new Date(loan.due_date) < new Date()
    ).length;

    return {
      totalLoans,
      activeLoans,
      totalDebt,
      overdueLoans,
    };
  }
}
