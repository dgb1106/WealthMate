import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsController } from './transactions.controller';
import { TransactionService } from './services/transaction.service';
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

  beforeEach(async () => {
    const transactionServiceMock = {
      createTransaction: jest.fn(),
      getAllTransactions: jest.fn(),
      getTransactionById: jest.fn(),
      getCurrentMonthTransactions: jest.fn(),
      getTransactionsForMonth: jest.fn(),
      getTransactionsForDateRange: jest.fn(),
      getIncomeTransactions: jest.fn(),
      getExpenseTransactions: jest.fn(),
      getTransactionsByCategory: jest.fn(),
      updateTransaction: jest.fn(),
      deleteTransaction: jest.fn(),
      getTransactionSummaryByCategory: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        { provide: TransactionService, useValue: transactionServiceMock },
      ],
    }).compile();

    controller = module.get<TransactionsController>(TransactionsController);
    transactionService = module.get(TransactionService) as jest.Mocked<TransactionService>;
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
      const transactions = [mockTransaction];
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

    it('should throw BadRequestException for invalid month', async () => {
      // Arrange
      const month = 12; // Invalid month
      const year = 2023;

      // Act & Assert
      await expect(controller.getMonthTransactions({ user: mockUser }, month, year))
        .rejects.toThrow(BadRequestException);
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
      const incomeTransaction = new Transaction({
        ...mockTransaction,
        amount: 100
      });
      transactionService.getIncomeTransactions.mockResolvedValue([incomeTransaction]);

      // Act
      const result = await controller.getIncomeTransactions({ user: mockUser });

      // Assert
      expect(transactionService.getIncomeTransactions).toHaveBeenCalledWith(mockUser.userId);
      expect(result).toEqual([incomeTransaction]);
    });
  });

  describe('getExpenseTransactions', () => {
    it('should return expense transactions', async () => {
      // Arrange
      transactionService.getExpenseTransactions.mockResolvedValue([mockTransaction]);

      // Act
      const result = await controller.getExpenseTransactions({ user: mockUser });

      // Assert
      expect(transactionService.getExpenseTransactions).toHaveBeenCalledWith(mockUser.userId);
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

  describe('getTransactionSummary', () => {
    it('should return transaction summary by category', async () => {
      // Arrange
      const startDate = '2023-01-01';
      const endDate = '2023-01-31';
      const summary = [{ category: { id: '1', name: 'Food' }, totalAmount: -100 }];
      transactionService.getTransactionSummaryByCategory.mockResolvedValue(summary);

      // Act
      const result = await controller.getTransactionSummary(
        { user: mockUser },
        startDate,
        endDate
      );

      // Assert
      expect(transactionService.getTransactionSummaryByCategory).toHaveBeenCalledWith(
        mockUser.userId,
        expect.any(Date),
        expect.any(Date)
      );
      expect(result).toEqual(summary);
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
        transactionId,
        mockUser.userId
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
