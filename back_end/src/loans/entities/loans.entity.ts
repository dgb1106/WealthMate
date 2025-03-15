import { User } from "../../users/entities/users.entity";
import { Type } from "class-transformer";
import { LoanStatus } from "../../common/enums/enum";

export class Loan {
  id: number;
  userId: string;
  
  @Type(() => User)
  user?: User;
  
  name: string;
  total_amount: number;
  remaining_amount: number;
  interest_rate: number;
  monthly_payment: number;
  due_date: Date;
  created_at: Date;
  status: LoanStatus;
  description?: string;
  remaining_principal: any;
  
  constructor(partial: Partial<Loan>) {
    Object.assign(this, partial);
  }
  
  /**
   * Kiểm tra xem khoản vay đã được trả hết chưa
   */
  isPaid(): boolean {
    return this.status === LoanStatus.PAID || this.remaining_amount <= 0;
  }
  
  /**
   * Kiểm tra xem khoản vay có đang hoạt động không
   */
  isActive(): boolean {
    return this.status === LoanStatus.ACTIVE;
  }
  
  /**
   * Kiểm tra xem khoản vay có bị quá hạn không
   */
  isOverdue(): boolean {
    return this.isActive() && new Date() > new Date(this.due_date);
  }
  
  /**
   * Tính số tiền lãi phải trả mỗi tháng
   */
  calculateMonthlyInterest(): number {
    return (this.remaining_amount * this.interest_rate / 100) / 12;
  }
  
  /**
   * Tính tổng số tiền phải trả (gốc + lãi)
   */
  calculateTotalPayable(): number {
    // Ước tính số tháng còn lại
    const currentDate = new Date();
    const dueDate = new Date(this.due_date);
    const monthsRemaining = this.getMonthsRemaining();
    
    if (monthsRemaining <= 0) return this.remaining_amount;
    
    // Tính tổng lãi dựa trên số dư còn lại và số tháng
    const monthlyInterest = this.calculateMonthlyInterest();
    const totalInterest = monthlyInterest * monthsRemaining;
    
    return this.remaining_amount + totalInterest;
  }
  
  /**
   * Thanh toán một khoản tiền cho khoản vay
   */
  makePayment(amount: number): void {
    if (amount <= 0) throw new Error("Số tiền thanh toán phải lớn hơn 0");
    
    // Cập nhật số tiền còn lại
    this.remaining_amount = Math.max(0, this.remaining_amount - amount);
    
    // Cập nhật trạng thái nếu đã thanh toán hết
    if (this.remaining_amount === 0) {
      this.status = LoanStatus.PAID;
    }
  }
  
  /**
   * Tính số ngày còn lại đến hạn thanh toán
   */
  getDaysRemaining(): number {
    if (this.isPaid()) return 0;
    
    const today = new Date();
    const dueDate = new Date(this.due_date);
    
    if (dueDate <= today) return 0;
    
    return Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }
  
  /**
   * Tính số tháng còn lại đến hạn thanh toán
   */
  getMonthsRemaining(): number {
    if (this.isPaid()) return 0;
    
    const today = new Date();
    const dueDate = new Date(this.due_date);
    
    if (dueDate <= today) return 0;
    
    return (dueDate.getFullYear() - today.getFullYear()) * 12 + 
           (dueDate.getMonth() - today.getMonth());
  }
  
  /**
   * Tính tỷ lệ thanh toán so với tổng khoản vay
   */
  getPaymentProgress(): number {
    if (this.total_amount <= 0) return 0;
    
    const paidAmount = this.total_amount - this.remaining_amount;
    return Math.min(100, Math.max(0, (paidAmount / this.total_amount) * 100));
  }
  
  /**
   * Lấy trạng thái thanh toán dễ đọc để hiển thị
   */
  getStatusDisplay(): 'paid' | 'ontrack' | 'atrisk' | 'overdue' {
    if (this.isPaid()) return 'paid';
    if (this.isOverdue()) return 'overdue';
    
    const daysRemaining = this.getDaysRemaining();
    if (daysRemaining < 7) return 'atrisk';
    
    return 'ontrack';
  }
  
  /**
   * Tính số tiền cần thanh toán hàng tháng để trả hết đúng hạn
   */
  calculateRequiredMonthlyPayment(): number {
    if (this.isPaid()) return 0;
    
    const monthsRemaining = this.getMonthsRemaining();
    if (monthsRemaining <= 0) return this.remaining_amount;
    
    // Tính toán bao gồm lãi suất
    const monthlyInterest = this.interest_rate / 100 / 12;
    
    // Sử dụng công thức tính toán khoản vay với lãi suất
    if (monthlyInterest === 0) {
      return this.remaining_amount / monthsRemaining;
    }
    
    const factor = Math.pow(1 + monthlyInterest, monthsRemaining);
    return (this.remaining_amount * monthlyInterest * factor) / (factor - 1);
  }
  
  /**
   * Định dạng đối tượng loan để trả về qua API
   */
  toResponseFormat(): any {
    return {
      id: this.id,
      userId: this.userId,
      name: this.name,
      total_amount: this.total_amount,
      remaining_amount: this.remaining_amount,
      interest_rate: this.interest_rate,
      monthly_payment: this.monthly_payment,
      due_date: this.due_date.toISOString(),
      created_at: this.created_at.toISOString(),
      status: this.status,
      status_display: this.getStatusDisplay(),
      description: this.description || '',
      is_paid: this.isPaid(),
      is_active: this.isActive(),
      is_overdue: this.isOverdue(),
      payment_progress: Math.round(this.getPaymentProgress() * 10) / 10,
      days_remaining: this.getDaysRemaining(),
      months_remaining: this.getMonthsRemaining(),
      monthly_interest: Math.round(this.calculateMonthlyInterest() * 100) / 100,
      total_payable: Math.round(this.calculateTotalPayable() * 100) / 100,
      recommended_monthly_payment: Math.round(this.calculateRequiredMonthlyPayment() * 100) / 100
    };
  }
  
  /**
   * Chuyển đổi đối tượng Prisma thành entity Loan
   */
  static fromPrisma(prismaLoan: any): Loan {
    return new Loan({
      id: Number(prismaLoan.id),
      userId: prismaLoan.userId,
      name: prismaLoan.name,
      total_amount: Number(prismaLoan.total_amount),
      remaining_amount: Number(prismaLoan.remaining_amount),
      interest_rate: Number(prismaLoan.interest_rate),
      monthly_payment: Number(prismaLoan.monthly_payment),
      due_date: new Date(prismaLoan.due_date),
      created_at: new Date(prismaLoan.created_at),
      status: prismaLoan.status,
      description: prismaLoan.description,
      user: prismaLoan.user 
        ? new User(prismaLoan.user) 
        : undefined
    });
  }
  
  /**
   * Chuyển đổi nhiều đối tượng Prisma thành mảng entity Loan
   */
  static fromPrismaArray(prismaLoans: any[]): Loan[] {
    return prismaLoans.map(loan => Loan.fromPrisma(loan));
  }
  
  /**
   * Tạo một entity Loan mới từ dữ liệu cơ bản
   */
  static create(data: {
    userId: string;
    name: string;
    total_amount: number;
    interest_rate: number;
    monthly_payment: number;
    due_date: Date;
    description?: string;
  }): Loan {
    return new Loan({
      userId: data.userId,
      name: data.name,
      total_amount: data.total_amount,
      remaining_amount: data.total_amount,
      interest_rate: data.interest_rate,
      monthly_payment: data.monthly_payment,
      due_date: new Date(data.due_date),
      created_at: new Date(),
      status: LoanStatus.ACTIVE,
      description: data.description || ''
    });
  }
}
