import { Loan } from "../entities/loans.entity";
import { CreateLoanDto } from "../dto/create-loans.dto";
import { UpdateLoanDto } from "../dto/update-loans.dto";
import { LoanStatus } from "../../common/enums/enum";

export interface LoanRepository {
  create(userId: string, createLoanDto: CreateLoanDto): Promise<Loan>;
  
  findAll(userId: string): Promise<Loan[]>;
  
  findById(userId: string, loanId: string): Promise<Loan | null>;
  
  update(userId: string, loanId: string, updateLoanDto: UpdateLoanDto): Promise<Loan>;
  
  delete(userId: string, loanId: string): Promise<boolean>;
  
  makePayment(userId: string, loanId: string, amount: number): Promise<Loan>;
  
  findByStatus(userId: string, status: LoanStatus): Promise<Loan[]>;
  
  findOverdueLoans(userId: string): Promise<Loan[]>;
  
  findUpcomingDueLoans(userId: string, daysThreshold?: number): Promise<Loan[]>;
  
  getLoanSummary(userId: string): Promise<{
    totalLoans: number;
    activeLoans: number;
    totalDebt: number;
    overdueLoans: number;
  }>;
}
