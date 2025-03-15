import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsController } from './transactions.controller';
import { TransactionService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Transaction } from './entities/transaction.entity';
import { BadRequestException } from '@nestjs/common';

describe('TransactionsController', () => {
  let controller: TransactionsController;
  let transactionService: jest.Mocked<TransactionService>;

  const mockUser = { userId: 'user-1' };
  
  const mockTransaction = new Transaction({
    id: '1',
    userId: mockUser.userId,
    categoryId: '1',
    amount: -50,
    description: 'Groceries',
    created_at: new Date()
  });
  
  const mockIncomeTransaction = new Transaction({
    id: '2',
    userId: mockUser.userId,
    categoryId: '2',
    amount: 1000,
    description: 'Salary',
    created_at: new Date()
  });

  beforeEach(async () => {
    const transactionServiceMock = {
      createTransaction: jest.fn(),
      getAllTransactions: jest.fn(),
      getTransactionById: jest.fn(),
      getCurrentMonthTransactions: jest.fn(),
      getTransactionsForMonth: jest.fn(),
      getTransactionsForDateRange: jest.fn(),
      getAllIncomeTransactions: jest.fn(),
      getCurrentMonthIncomeTransactions: jest.fn(),
      getIncomeTransactionsForMonth: jest.fn(),
      getAllExpenseTransactions: jest.fn(),
      getCurrentMonthExpenseTransactions: jest.fn(),
      getExpenseTransactionsForMonth: jest.fn(),
      getTransactionsByCategory: jest.fn(),
      getCurrentMonthTransactionsByCategory: jest.fn(),
      getTransactionsByCategoryForMonth: jest.fn(),
      getTransactionSummaryByCategory: jest.fn(),
      getTransactionSummaryByCategoryForMonth: jest.fn(),
      getTotalAmountByCategoryForUserForDateRange: jest.fn(),
      getFinancialSummaryForMonth: jest.fn(),
      updateTransaction: jest.fn(),
      deleteTransaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        { provide: TransactionService, useValue: transactionServiceMock },
      ],
    }).compile();

    controller = module.get<TransactionsController>(TransactionsController);
    transactionService = module.get(TransactionService) as jest.Mocked<TransactionService>;
    
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createTransaction', () => {
    it('should create a transaction', async () => {
      // Arrange
      const createDto: CreateTransactionDto = {
        categoryId: '1',
        amount: 50,
        description: 'Groceries',
      };
      transactionService.createTransaction.mockResolvedValue(mockTransaction);

      // Act
      const result = await controller.createTransaction({ user: mockUser }, createDto);

      // Assert
      expect(transactionService.createTransaction).toHaveBeenCalledWith(mockUser.userId, createDto);
      expect(result).toEqual(mockTransaction);
    });
  });

  describe('findAllTransactions', () => {
    it('should return all transactions', async () => {
      // Arrange
      const transactions = [mockTransaction, mockIncomeTransaction];
      transactionService.getAllTransactions.mockResolvedValue(transactions);

      // Act
      const result = await controller.findAllTransactions({ user: mockUser });

      // Assert
      expect(transactionService.getAllTransactions).toHaveBeenCalledWith(mockUser.userId);
      expect(result).toEqual(transactions);
    });
  });

  describe('getCurrentMonthTransactions', () => {
    it('should return current month transactions', async () => {
      // Arrange
      const transactions = [mockTransaction];
      transactionService.getCurrentMonthTransactions.mockResolvedValue(transactions);

      // Act
      const result = await controller.getCurrentMonthTransactions({ user: mockUser });

      // Assert
      expect(transactionService.getCurrentMonthTransactions).toHaveBeenCalledWith(mockUser.userId);
      expect(result).toEqual(transactions);
    });
  });

  describe('getMonthTransactions', () => {
    it('should return transactions for specific month and year', async () => {
      // Arrange
      const transactions = [mockTransaction];
      const month = 0; // January
      const year = 2023;
      transactionService.getTransactionsForMonth.mockResolvedValue(transactions);

      // Act
      const result = await controller.getMonthTransactions({ user: mockUser }, month, year);

      // Assert
      expect(transactionService.getTransactionsForMonth).toHaveBeenCalledWith(
        mockUser.userId,
        month,
        year
      );
      expect(result).toEqual(transactions);
    });
  });

  describe('getDateRangeTransactions', () => {
    it('should return transactions for date range', async () => {
      // Arrange
      const transactions = [mockTransaction];
      const startDate = '2023-01-01';
      const endDate = '2023-01-31';
      transactionService.getTransactionsForDateRange.mockResolvedValue(transactions);

      // Act
      const result = await controller.getDateRangeTransactions(
        { user: mockUser },
        startDate,
        endDate
      );

      // Assert
      expect(transactionService.getTransactionsForDateRange).toHaveBeenCalledWith(
        mockUser.userId,
        expect.any(Date),
        expect.any(Date)
      );
      expect(result).toEqual(transactions);
    });
  });

  describe('getIncomeTransactions', () => {
    it('should return income transactions', async () => {
      // Arrange
      transactionService.getAllIncomeTransactions.mockResolvedValue([mockIncomeTransaction]);

      // Act
      const result = await controller.getIncomeTransactions({ user: mockUser });

      // Assert
      expect(transactionService.getAllIncomeTransactions).toHaveBeenCalledWith(mockUser.userId);
      expect(result).toEqual([mockIncomeTransaction]);
    });
  });

  describe('getCurrentMonthIncomeTransactions', () => {
    it('should return current month income transactions', async () => {
      // Arrange
      transactionService.getCurrentMonthIncomeTransactions.mockResolvedValue([mockIncomeTransaction]);

      // Act
      const result = await controller.getCurrentMonthIncomeTransactions({ user: mockUser });

      // Assert
      expect(transactionService.getCurrentMonthIncomeTransactions).toHaveBeenCalledWith(mockUser.userId);
      expect(result).toEqual([mockIncomeTransaction]);
    });
  });

  describe('getIncomeTransactionsForMonth', () => {
    it('should return income transactions for specific month and year', async () => {
      // Arrange
      const month = 0; // January
      const year = 2023;
      transactionService.getIncomeTransactionsForMonth.mockResolvedValue([mockIncomeTransaction]);

      // Act
      const result = await controller.getIncomeTransactionsForMonth(
        { user: mockUser },
        month,
        year
      );

      // Assert
      expect(transactionService.getIncomeTransactionsForMonth).toHaveBeenCalledWith(
        mockUser.userId,
        month,
        year
      );
      expect(result).toEqual([mockIncomeTransaction]);
    });
  });

  describe('getExpenseTransactions', () => {
    it('should return expense transactions', async () => {
      // Arrange
      transactionService.getAllExpenseTransactions.mockResolvedValue([mockTransaction]);

      // Act
      const result = await controller.getExpenseTransactions({ user: mockUser });

      // Assert
      expect(transactionService.getAllExpenseTransactions).toHaveBeenCalledWith(mockUser.userId);
      expect(result).toEqual([mockTransaction]);
    });
  });

  describe('getCurrentMonthExpenseTransactions', () => {
    it('should return current month expense transactions', async () => {
      // Arrange
      transactionService.getCurrentMonthExpenseTransactions.mockResolvedValue([mockTransaction]);

      // Act
      const result = await controller.getCurrentMonthExpenseTransactions({ user: mockUser });

      // Assert
      expect(transactionService.getCurrentMonthExpenseTransactions).toHaveBeenCalledWith(mockUser.userId);
      expect(result).toEqual([mockTransaction]);
    });
  });

  describe('getExpenseTransactionsForMonth', () => {
    it('should return expense transactions for specific month and year', async () => {
      // Arrange
      const month = 0; // January
      const year = 2023;
      transactionService.getExpenseTransactionsForMonth.mockResolvedValue([mockTransaction]);

      // Act
      const result = await controller.getExpenseTransactionsForMonth(
        { user: mockUser },
        month,
        year
      );

      // Assert
      expect(transactionService.getExpenseTransactionsForMonth).toHaveBeenCalledWith(
        mockUser.userId,
        month,
        year
      );
      expect(result).toEqual([mockTransaction]);
    });
  });

  describe('getCategoryTransactions', () => {
    it('should return transactions for a category', async () => {
      // Arrange
      const categoryId = '1';
      transactionService.getTransactionsByCategory.mockResolvedValue([mockTransaction]);

      // Act
      const result = await controller.getCategoryTransactions({ user: mockUser }, categoryId);

      // Assert
      expect(transactionService.getTransactionsByCategory).toHaveBeenCalledWith(
        mockUser.userId,
        categoryId
      );
      expect(result).toEqual([mockTransaction]);
    });
  });

  describe('getCurrentMonthCategoryTransactions', () => {
    it('should return current month transactions for a category', async () => {
      // Arrange
      const categoryId = '1';
      transactionService.getCurrentMonthTransactionsByCategory.mockResolvedValue([mockTransaction]);

      // Act
      const result = await controller.getCurrentMonthCategoryTransactions({ user: mockUser }, categoryId);

      // Assert
      expect(transactionService.getCurrentMonthTransactionsByCategory).toHaveBeenCalledWith(
        mockUser.userId,
        categoryId
      );
      expect(result).toEqual([mockTransaction]);
    });
  });

  describe('getCategoryTransactionsForMonth', () => {
    it('should return transactions for a category for specific month and year', async () => {
      // Arrange
      const categoryId = '1';
      const month = 0; // January
      const year = 2023;
      transactionService.getTransactionsByCategoryForMonth.mockResolvedValue([mockTransaction]);

      // Act
      const result = await controller.getCategoryTransactionsForMonth(
        { user: mockUser },
        categoryId,
        month,
        year
      );

      // Assert
      expect(transactionService.getTransactionsByCategoryForMonth).toHaveBeenCalledWith(
        mockUser.userId,
        categoryId,
        month,
        year
      );
      expect(result).toEqual([mockTransaction]);
    });
  });

  describe('getTransactionSummaryForMonth', () => {
    it('should return transaction summary for specific month and year', async () => {
      // Arrange
      const month = '0'; // January
      const year = '2023';
      const summary = [{ category: { id: '1', name: 'Food' }, totalAmount: -100 }];
      transactionService.getTransactionSummaryByCategoryForMonth.mockResolvedValue(summary);

      // Act
      const result = await controller.getTransactionSummaryForMonth(
        { user: mockUser },
        month,
        year
      );

      // Assert
      expect(transactionService.getTransactionSummaryByCategoryForMonth).toHaveBeenCalledWith(
        mockUser.userId,
        month,
        year
      );
      expect(result).toEqual(summary);
    });
  });

  describe('getTotalAmountByCategory', () => {
    it('should return total amount for a category in date range', async () => {
      // Arrange
      const categoryId = '1';
      const startDate = '2023-01-01';
      const endDate = '2023-01-31';
      const total = -150;
      transactionService.getTotalAmountByCategoryForUserForDateRange.mockResolvedValue(total);

      // Act
      const result = await controller.getTotalAmountByCategory(
        { user: mockUser },
        categoryId,
        startDate,
        endDate
      );

      // Assert
      expect(transactionService.getTotalAmountByCategoryForUserForDateRange).toHaveBeenCalledWith(
        mockUser.userId,
        expect.any(Date),
        expect.any(Date),
        categoryId
      );
      expect(result).toEqual(total);
    });
  });

  describe('getTransaction', () => {
    it('should return a transaction by id', async () => {
      // Arrange
      const transactionId = '1';
      transactionService.getTransactionById.mockResolvedValue(mockTransaction);

      // Act
      const result = await controller.getTransaction({ user: mockUser }, transactionId);

      // Assert
      expect(transactionService.getTransactionById).toHaveBeenCalledWith(
        mockUser.userId,
        transactionId
      );
      expect(result).toEqual(mockTransaction);
    });
  });

  describe('updateTransaction', () => {
    it('should update a transaction', async () => {
      // Arrange
      const transactionId = '1';
      const updateDto: UpdateTransactionDto = {
        amount: 75,
        description: 'Updated groceries',
      };
      
      const updatedTransaction = new Transaction({
        id: mockTransaction.id,
        userId: mockTransaction.userId,
        categoryId: mockTransaction.categoryId,
        created_at: mockTransaction.created_at,
        amount: -75,
        description: 'Updated groceries'
      });
      
      transactionService.updateTransaction.mockResolvedValue(updatedTransaction);

      // Act
      const result = await controller.updateTransaction(
        { user: mockUser },
        transactionId,
        updateDto
      );

      // Assert
      expect(transactionService.updateTransaction).toHaveBeenCalledWith(
        mockUser.userId,
        transactionId,
        updateDto
      );
      expect(result).toEqual(updatedTransaction);
    });
  });

  describe('deleteTransaction', () => {
    it('should delete a transaction', async () => {
      // Arrange
      const transactionId = '1';
      const deleteResult = { message: 'Transaction deleted', newBalance: 950 };
      transactionService.deleteTransaction.mockResolvedValue(deleteResult);

      // Act
      const result = await controller.deleteTransaction({ user: mockUser }, transactionId);

      // Assert
      expect(transactionService.deleteTransaction).toHaveBeenCalledWith(
        mockUser.userId,
        transactionId
      );
      expect(result).toEqual(deleteResult);
    });
  });
});