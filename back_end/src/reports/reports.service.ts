import { Injectable } from '@nestjs/common';
import { TransactionService } from '../transactions/transactions.service';
import { DateUtilsService } from '../common/services/date-utils.service';
import { BudgetsService } from 'src/budgets/budgets.service';
import { LoansService } from 'src/loans/loans.service';
import { GoalsService } from 'src/goals/goals.service';

@Injectable()
export class ReportsService {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly dateUtils: DateUtilsService,
    private readonly budgetsService: BudgetsService,
    private readonly loansService: LoansService,
    private readonly goalsService: GoalsService
  ) {}

  // Báo cáo: Income and Expense của Tháng hiện tại
  async getCurrentMonthIncomeExpenseReport(userId: string): Promise<any> {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    const [incomeTx, expenseTx] = await Promise.all([
      this.transactionService.getIncomeTransactionsForMonth(userId, currentMonth, currentYear),
      this.transactionService.getExpenseTransactionsForMonth(userId, currentMonth, currentYear)
    ]);
    
    const totalIncome = incomeTx.reduce((sum, tx) => sum + Number(tx.amount), 0);
    const totalExpense = expenseTx.reduce((sum, tx) => sum + Number(tx.amount), 0);
    
    return {
      reportType: 'income-expense-current',
      generatedAt: new Date().toISOString(),
      data: {
        year: currentYear,
        month: currentMonth,
        monthName: this.dateUtils.getMonthName(currentMonth) as string,
        totalIncome,
        totalExpense,
        net: totalIncome - totalExpense
      }
    };
  }

  // Báo cáo: Income and Expense từ đầu năm đến tháng hiện tại
  async getYearToDateIncomeExpenseReport(userId: string): Promise<any> {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const reportData: { year: number; month: number; monthName: string; totalIncome: number; totalExpense: number; net: number }[] = [];

    for (let month = 0; month <= currentMonth; month++) {
      const [incomeTx, expenseTx] = await Promise.all([
        this.transactionService.getIncomeTransactionsForMonth(userId, month, currentYear),
        this.transactionService.getExpenseTransactionsForMonth(userId, month, currentYear)
      ]);

      const totalIncome = incomeTx.reduce((sum, tx) => sum + Number(tx.amount), 0);
      const totalExpense = expenseTx.reduce((sum, tx) => sum + Number(tx.amount), 0);

      reportData.push({
        year: currentYear,
        month,
        monthName: this.dateUtils.getMonthName(month) as string,
        totalIncome,
        totalExpense,
        net: totalIncome - totalExpense
      });
    }

    return {
      reportType: 'income-expense-ytd',
      generatedAt: new Date().toISOString(),
      data: reportData
    };
  }

  // Thêm báo cáo: Most spent categories per month
  async getMostSpentCategoriesReport(userId: string, limit: number = 5): Promise<any> {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const reportData: { year: number; month: number; monthName: string; topCategories: any[] }[] = [];
    
    for (let month = 0; month <= currentMonth; month++) {
      // Sử dụng transactionService để lấy tổng hợp giao dịch theo danh mục cho tháng
      const summary = await this.transactionService.getTransactionSummaryByCategoryForMonth(
        userId,
        month.toString(),
        currentYear.toString()
      );

      // Sửa điều kiện lọc để kiểm tra type nằm trong item.category
      const expenseCategories = summary
        .filter(item => item.category?.type === 'EXPENSE')
        .sort((a, b) => Math.abs(Number(b.totalAmount)) - Math.abs(Number(a.totalAmount)))
        .slice(0, limit);

      reportData.push({
        year: currentYear,
        month,
        monthName: this.dateUtils.getMonthName(month) as string,
        topCategories: expenseCategories
      });
    }

    return {
      reportType: 'monthly-most-spent-categories',
      generatedAt: new Date().toISOString(),
      limit,
      data: reportData
    };
  }

  // Thêm báo cáo: Most spent categories for current month
  async getCurrentMonthMostSpentCategoriesReport(userId: string, limit: number = 5): Promise<any> {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const summary = await this.transactionService.getTransactionSummaryByCategoryForMonth(
      userId,
      currentMonth.toString(),
      currentYear.toString()
    );
    const expenseCategories = summary
      .filter(item => item.type === 'EXPENSE')
      .sort((a, b) => Math.abs(Number(b.totalAmount)) - Math.abs(Number(a.totalAmount)))
      .slice(0, limit);

    return {
      reportType: 'most-spent-categories-current',
      generatedAt: new Date().toISOString(),
      limit,
      data: {
        year: currentYear,
        month: currentMonth,
        monthName: this.dateUtils.getMonthName(currentMonth) as string,
        topCategories: expenseCategories
      }
    };
  }

  // Báo cáo: Phân tích theo danh mục
  async getCategoryAnalysisReport(userId: string, month?: number, year?: number): Promise<any> {
    const currentDate = new Date();
    const m = month !== undefined ? month : currentDate.getMonth();
    const y = year !== undefined ? year : currentDate.getFullYear();

    // Lấy tổng hợp giao dịch theo danh mục cho tháng
    const summary = await this.transactionService.getTransactionSummaryByCategoryForMonth(
      userId,
      m.toString(),
      y.toString()
    );
    
    // Phân tích chi tiêu theo danh mục
    const expenseCategories = summary.filter(item => item.category?.type === 'EXPENSE');
    const totalExpense = expenseCategories.reduce((sum, item) => 
      sum + Math.abs(Number(item.totalAmount)), 0);
    const expenseDistribution = expenseCategories.map(item => ({
      categoryId: item.category.id,
      categoryName: item.category.name,
      amount: Math.abs(Number(item.totalAmount)),
      percentage: totalExpense > 0 ? Math.round((Math.abs(Number(item.totalAmount)) / totalExpense * 1000)) / 10 : 0
    }));

    // Phân tích thu nhập theo nguồn (giả sử nguồn thu nhập được biểu diễn bởi danh mục có type 'INCOME')
    const incomeSources = summary.filter(item => item.category?.type === 'INCOME');
    const totalIncome = incomeSources.reduce((sum, item) => 
      sum + Math.abs(Number(item.totalAmount)), 0);
    const incomeDistribution = incomeSources.map(item => ({
      sourceId: item.category.id,
      sourceName: item.category.name,
      amount: Math.abs(Number(item.totalAmount)),
      percentage: totalIncome > 0 ? Math.round((Math.abs(Number(item.totalAmount)) / totalIncome * 1000)) / 10 : 0
    }));

    return {
      reportType: 'category-analysis',
      generatedAt: new Date().toISOString(),
      data: {
        month: m,
        year: y,
        expenseByCategory: expenseDistribution,
        incomeBySource: incomeDistribution
      }
    };
  }

  // Thêm Báo cáo ngân sách: So sánh ngân sách dự kiến với chi tiêu thực tế theo từng danh mục
  async getBudgetReport(userId: string): Promise<any> {
    const budgets = await this.budgetsService.getCurrentBudgets(userId);
    let totalBudget = 0;
    let totalSpent = 0;
    
    const budgetDetails = budgets.map(budget => {
      const limit = Number(budget.limit_amount);
      const spent = Number(budget.spent_amount);
      const remaining = limit - spent;
      const percentageUsed = limit > 0 ? Math.round((spent / limit) * 1000) / 10 : 0;
      totalBudget += limit;
      totalSpent += spent;
      return {
        categoryId: budget.categoryId, // hoặc budget.category?.id nếu dữ liệu như vậy
        categoryName: budget.categoryName || budget.category?.name,
        limitAmount: limit,
        spentAmount: spent,
        remainingAmount: remaining,
        percentageUsed,
        warning: percentageUsed >= 90 ? 'Warning: Near budget limit' : ''
      };
    });
    
    const overallPercentageUsed = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 1000) / 10 : 0;
    
    return {
      reportType: 'budget-report',
      generatedAt: new Date().toISOString(),
      data: {
        budgets: budgetDetails,
        summary: {
          totalBudget,
          totalSpent,
          totalRemaining: totalBudget - totalSpent,
          overallPercentageUsed
        }
      }
    };
  }

  // Báo cáo khoản vay (Loan Report)
  async getLoanReport(userId: string): Promise<any> {
    const loans = await this.loansService.getLoans(userId);
    // Optionally, for each active loan, get repayment timeline
    const loanReports = await Promise.all(loans.map(async loan => {
      if(loan.status === 'ACTIVE'){
        const repaymentPlan = await this.loansService.getRepaymentPlan(userId, loan.id);
        return { ...loan, repaymentPlan };
      }
      return loan;
    }));
    return {
      reportType: 'loan-report',
      generatedAt: new Date().toISOString(),
      data: loanReports
    };
  }

  // Báo cáo mục tiêu tài chính (Goals Progress Report)
  async getGoalsProgressReport(userId: string): Promise<any> {
    const goals = await this.goalsService.findAll(userId);
    // Tính tiến độ % cho mỗi mục tiêu
    const goalsProgress = goals.map(goal => {
      const progress = goal.target_amount > 0
        ? Math.round((goal.saved_amount / goal.target_amount) * 1000) / 10
        : 0;
      return { ...goal, progress };
    });
    return {
      reportType: 'goals-progress-report',
      generatedAt: new Date().toISOString(),
      data: goalsProgress
    };
  }

  // Báo cáo dòng tiền (Cash Flow Report)
  async getCashFlowReport(userId: string, months: number = 6): Promise<any> {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    // Xác định khoảng thời gian mong muốn
    let startMonth = currentMonth - months + 1;
    let startYear = currentYear;
    if (startMonth < 0) {
      startYear -= 1;
      startMonth += 12;
    }
    const monthlyData: { year: number; month: number; monthName: string; totalIncome: number; totalExpense: number; net: number }[] = [];

    for (let m = startMonth; m <= currentMonth; m++) {
      const [incomeTx, expenseTx] = await Promise.all([
        this.transactionService.getIncomeTransactionsForMonth(userId, m, currentYear),
        this.transactionService.getExpenseTransactionsForMonth(userId, m, currentYear)
      ]);
      const totalIncome = incomeTx.reduce((sum, tx) => sum + Number(tx.amount), 0);
      const totalExpense = expenseTx.reduce((sum, tx) => sum + Number(tx.amount), 0);
      monthlyData.push({
        year: currentYear,
        month: m,
        monthName: this.dateUtils.getMonthName(m) as string,
        totalIncome,
        totalExpense,
        net: totalIncome - totalExpense
      });
    }
    return {
      reportType: 'cash-flow-report',
      generatedAt: new Date().toISOString(),
      period: { months },
      data: monthlyData
    };
  }

  // Báo cáo xu hướng tài chính (Trend Analysis Report)
  async getTrendAnalysisReport(userId: string, months: number = 12): Promise<any> {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const monthlyData: { year: number; month: number; monthName: string; totalIncome: number; totalExpense: number; net: number }[] = [];

    // Xác định khoảng thời gian phân tích
    let startMonth = currentMonth - months + 1;
    let startYear = currentYear;
    if (startMonth < 0) {
      startYear -= 1;
      startMonth += 12;
    }
    for (let m = startMonth; m <= currentMonth; m++) {
      const [incomeTx, expenseTx] = await Promise.all([
        this.transactionService.getIncomeTransactionsForMonth(userId, m, currentYear),
        this.transactionService.getExpenseTransactionsForMonth(userId, m, currentYear)
      ]);
      const totalIncome = incomeTx.reduce((sum, tx) => sum + Number(tx.amount), 0);
      const totalExpense = expenseTx.reduce((sum, tx) => sum + Number(tx.amount), 0);
      monthlyData.push({
        year: currentYear,
        month: m,
        monthName: this.dateUtils.getMonthName(m) as string,
        totalIncome,
        totalExpense,
        net: totalIncome - totalExpense
      });
    }
    // Tính trung bình của các chỉ số làm ví dụ (có thể mở rộng phân tích)
    const avgIncome = Math.round(monthlyData.reduce((sum, d) => sum + d.totalIncome, 0) / monthlyData.length * 100) / 100;
    const avgExpense = Math.round(monthlyData.reduce((sum, d) => sum + d.totalExpense, 0) / monthlyData.length * 100) / 100;
    const avgNet = Math.round(monthlyData.reduce((sum, d) => sum + d.net, 0) / monthlyData.length * 100) / 100;

    return {
      reportType: 'trend-analysis-report',
      generatedAt: new Date().toISOString(),
      period: { months },
      statistics: {
        averageIncome: avgIncome,
        averageExpense: avgExpense,
        averageNet: avgNet
      },
      data: monthlyData
    };
  }
}
