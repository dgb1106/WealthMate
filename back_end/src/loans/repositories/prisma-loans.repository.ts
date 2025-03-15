import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LoanRepository } from './loans-repository.interface';
import { Loan } from '../entities/loans.entity';
import { CreateLoanDto } from '../dto/create-loans.dto';
import { UpdateLoanDto } from '../dto/update-loans.dto';
import { LoanStatus } from '../../common/enums/enum';

@Injectable()
export class PrismaLoanRepository implements LoanRepository {
  constructor(private readonly prisma: PrismaService) {}
  
  async create(userId: string, createLoanDto: CreateLoanDto): Promise<Loan> {
    // Tạo entity Loan
    const loanEntity = Loan.create({
      userId,
      name: createLoanDto.name,
      total_amount: createLoanDto.total_amount,
      interest_rate: createLoanDto.interest_rate,
      monthly_payment: createLoanDto.monthly_payment,
      due_date: new Date(createLoanDto.due_date),
      description: createLoanDto.description
    });
    
    // Lưu vào database
    const createdLoan = await this.prisma.loans.create({
      data: {
        userId: loanEntity.userId,
        name: loanEntity.name,
        total_amount: loanEntity.total_amount,
        remaining_amount: loanEntity.remaining_amount,
        interest_rate: loanEntity.interest_rate,
        monthly_payment: loanEntity.monthly_payment,
        due_date: loanEntity.due_date,
        created_at: loanEntity.created_at,
        status: loanEntity.status,
        description: loanEntity.description || ''
      }
    });
    
    return Loan.fromPrisma(createdLoan);
  }
  
  async findAll(userId: string): Promise<Loan[]> {
    const loans = await this.prisma.loans.findMany({
      where: { userId },
      orderBy: { due_date: 'asc' }
    });
    
    return Loan.fromPrismaArray(loans);
  }
  
  async findById(userId: string, loanId: string): Promise<Loan | null> {
    const loan = await this.prisma.loans.findFirst({
      where: {
        id: Number(loanId),
        userId
      }
    });
    
    if (!loan) return null;
    
    return Loan.fromPrisma(loan);
  }
  
  async update(userId: string, loanId: string, updateLoanDto: UpdateLoanDto): Promise<Loan> {
    // Kiểm tra xem khoản vay có tồn tại không
    const existingLoan = await this.findById(userId, loanId);
    if (!existingLoan) {
      throw new NotFoundException(`Khoản nợ với ID ${loanId} không tồn tại`);
    }
    
    // Chuẩn bị dữ liệu cập nhật
    const updateData: any = {};
    
    if (updateLoanDto.name !== undefined) updateData.name = updateLoanDto.name;
    if (updateLoanDto.due_date !== undefined) updateData.due_date = new Date(updateLoanDto.due_date);
    if (updateLoanDto.total_amount !== undefined) updateData.total_amount = Number(updateLoanDto.total_amount);
    if (updateLoanDto.remaining_amount !== undefined) updateData.remaining_amount = Number(updateLoanDto.remaining_amount);
    if (updateLoanDto.status !== undefined) updateData.status = updateLoanDto.status;
    if (updateLoanDto.interest_rate !== undefined) updateData.interest_rate = Number(updateLoanDto.interest_rate);
    if (updateLoanDto.monthly_payment !== undefined) updateData.monthly_payment = Number(updateLoanDto.monthly_payment);
    if (updateLoanDto.description !== undefined) updateData.description = updateLoanDto.description;
    
    // Nếu remaining_amount được cập nhật, kiểm tra trạng thái
    if (updateLoanDto.remaining_amount !== undefined) {
      const updatedLoanEntity = Loan.fromPrisma({
        ...existingLoan,
        remaining_amount: Number(updateLoanDto.remaining_amount)
      });
      
      // Cập nhật trạng thái nếu cần
      if (updatedLoanEntity.isPaid() && existingLoan.status !== LoanStatus.PAID) {
        updateData.status = LoanStatus.PAID;
      }
    }
    
    // Cập nhật trong database
    const updatedLoan = await this.prisma.loans.update({
      where: { id: Number(loanId) },
      data: updateData
    });
    
    return Loan.fromPrisma(updatedLoan);
  }
  
  async delete(userId: string, loanId: string): Promise<boolean> {
    // Kiểm tra xem khoản vay có tồn tại không
    const existingLoan = await this.findById(userId, loanId);
    if (!existingLoan) {
      throw new NotFoundException(`Khoản nợ với ID ${loanId} không tồn tại`);
    }
    
    // Xoá khoản vay
    await this.prisma.loans.delete({
      where: { id: Number(loanId) }
    });
    
    return true;
  }
  
  async makePayment(userId: string, loanId: string, amount: number): Promise<Loan> {
    // Kiểm tra xem khoản vay có tồn tại không
    const existingLoan = await this.findById(userId, loanId);
    if (!existingLoan) {
      throw new NotFoundException(`Khoản nợ với ID ${loanId} không tồn tại`);
    }
    
    // Kiểm tra trạng thái khoản vay
    if (existingLoan.status === LoanStatus.PAID) {
      throw new BadRequestException('Khoản nợ này đã được trả hết');
    }
    
    // Thực hiện thanh toán bằng entity
    const loanEntity = Loan.fromPrisma(existingLoan);
    loanEntity.makePayment(amount);
    
    // Cập nhật trong database
    const updatedLoan = await this.prisma.loans.update({
      where: { id: Number(loanId) },
      data: {
        remaining_amount: loanEntity.remaining_amount,
        status: loanEntity.status
      }
    });
    
    return Loan.fromPrisma(updatedLoan);
  }
  
  async findByStatus(userId: string, status: LoanStatus): Promise<Loan[]> {
    const loans = await this.prisma.loans.findMany({
      where: {
        userId,
        status
      },
      orderBy: { due_date: 'asc' }
    });
    
    return Loan.fromPrismaArray(loans);
  }
  
  async findOverdueLoans(userId: string): Promise<Loan[]> {
    const today = new Date();
    
    const loans = await this.prisma.loans.findMany({
      where: {
        userId,
        status: LoanStatus.ACTIVE,
        due_date: {
          lt: today
        }
      },
      orderBy: { due_date: 'asc' }
    });
    
    return Loan.fromPrismaArray(loans);
  }
  
  async findUpcomingDueLoans(userId: string, daysThreshold: number = 30): Promise<Loan[]> {
    const today = new Date();
    const thresholdDate = new Date();
    thresholdDate.setDate(today.getDate() + daysThreshold);
    
    const loans = await this.prisma.loans.findMany({
      where: {
        userId,
        status: LoanStatus.ACTIVE,
        due_date: {
          gte: today,
          lte: thresholdDate
        }
      },
      orderBy: { due_date: 'asc' }
    });
    
    return Loan.fromPrismaArray(loans);
  }
  
  async getLoanSummary(userId: string): Promise<{
    totalLoans: number;
    activeLoans: number;
    totalDebt: number;
    overdueLoans: number;
  }> {
    const loans = await this.prisma.loans.findMany({
      where: { userId }
    });
    
    const loanEntities = Loan.fromPrismaArray(loans);
    
    return {
      totalLoans: loanEntities.length,
      activeLoans: loanEntities.filter(loan => loan.isActive()).length,
      totalDebt: loanEntities.reduce((sum, loan) => sum + Number(loan.remaining_amount), 0),
      overdueLoans: loanEntities.filter(loan => loan.isOverdue()).length
    };
  }
}
