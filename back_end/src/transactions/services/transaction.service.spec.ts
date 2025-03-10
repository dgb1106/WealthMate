import { Test, TestingModule } from '@nestjs/testing';
import { TransactionService } from './transaction.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { TransactionType } from '../../common/enums/enum';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { Decimal } from '@prisma/client/runtime/library';
import { TransactionDomainService } from './transaction-domain.service';
import { TransactionRepository } from '../repositories/transaction-repository.interface';

// Mock PrismaService
const mockPrismaService = {
  $transaction: jest.fn().mockImplementation(callback => callback(mockPrismaService)),
  categories: {
    findUnique: jest.fn(),
  },
  transactions: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  },
  users: {
    update: jest.fn(),
  }
};

// Add this mock
const mockCacheManager = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  reset: jest.fn(),
};

const mockTransactionDomainService = {
  validateDateRange: jest.fn(),
  calculateTransactionAmount: jest.fn(),
  // Add any other methods from this service that are used
};


const mockTransactionRepository = {
  create: jest.fn().mockImplementation((userId, categoryId, amount, description) => {
    return {
      id: '123',
      userId,
      categoryId,
      amount,
      description,
      createdAt: new Date()
    };
  }),
  
  findById: jest.fn().mockImplementation((id, userId) => {
    return {
      id,
      userId,
      categoryId: '456',
      amount: 100,
      description: 'Mock transaction',
      createdAt: new Date()
    };
  }),
  
  findAllByUser: jest.fn().mockResolvedValue([
    {
      id: '1',
      userId: '123',
      categoryId: '456',
      amount: 100,
      description: 'Mock transaction 1',
      createdAt: new Date()
    },
    {
      id: '2',
      userId: '123',
      categoryId: '457',
      amount: -50,
      description: 'Mock transaction 2',
      createdAt: new Date()
    }
  ]),
  
  findAllByUserForDateRange: jest.fn().mockImplementation((userId, startDate, endDate) => {
    return [
      {
        id: '1',
        userId,
        categoryId: '456',
        amount: 100,
        description: 'Mock transaction in date range',
        createdAt: new Date()
      }
    ];
  }),
  
  findAllByUserAndCategory: jest.fn().mockImplementation((userId, categoryId) => {
    return [
      {
        id: '1',
        userId,
        categoryId,
        amount: 100,
        description: 'Mock transaction for category',
        createdAt: new Date()
      }
    ];
  }),
  
  findAllIncomeByUser: jest.fn().mockImplementation((userId) => {
    return [
      {
        id: '1',
        userId,
        categoryId: '456',
        amount: 100,
        description: 'Mock income transaction',
        createdAt: new Date()
      }
    ];
  }),
  
  findAllExpensesByUser: jest.fn().mockImplementation((userId) => {
    return [
      {
        id: '2',
        userId,
        categoryId: '457',
        amount: -50,
        description: 'Mock expense transaction',
        createdAt: new Date()
      }
    ];
  }),
  
  update: jest.fn().mockImplementation((id, userId, data) => {
    return {
      id,
      userId,
      categoryId: data.categoryId || '456',
      amount: data.amount || 100,
      description: data.description || 'Updated mock transaction',
      createdAt: new Date()
    };
  }),
  
  delete: jest.fn().mockResolvedValue(true),
  
  getSummaryByCategory: jest.fn().mockImplementation((userId, startDate, endDate) => {
    return [
      {
        category: { id: '456', name: 'Category 1', type: 'INCOME' },
        totalAmount: 500
      },
      {
        category: { id: '457', name: 'Category 2', type: 'EXPENSE' },
        totalAmount: -300
      }
    ];
  }),
  
  getTotalAmountByCategoryForUser: jest.fn().mockImplementation((userId, categoryId) => {
    return categoryId === '456' ? 500 : -300;
  })
};

describe('TransactionService', () => {
  let service: TransactionService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: 'CACHE_MANAGER', // Make sure this is the exact token name used
          useValue: mockCacheManager,
        },
        {
          provide: 'TRANSACTION_REPOSITORY', // Replace with actual token if different
          useValue: mockTransactionRepository,
        },
        {
          provide: TransactionDomainService,
          useValue: mockTransactionDomainService,
        },
      ],
    }).compile();
    service = module.get<TransactionService>(TransactionService);
    prisma = module.get<PrismaService>(PrismaService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a transaction for expense category and decrease user balance', async () => {
      // Arrange
      const userId = '123';
      const createTransactionDto: CreateTransactionDto = {
        categoryId: '456',
        amount: 100,
        description: 'Test expense'
      };
      
      const mockCategory = {
        id: BigInt(456),
        name: 'Test Category',
        type: TransactionType.EXPENSE,
        userId: BigInt(123)
      };

      const mockTransaction = {
        id: BigInt(789),
        userId: BigInt(123),
        categoryId: BigInt(456),
        amount: new Decimal(100),
        description: 'Test expense',
        created_at: new Date()
      };

      mockPrismaService.categories.findUnique.mockResolvedValue(mockCategory);
      mockPrismaService.transactions.create.mockResolvedValue(mockTransaction);
      mockPrismaService.users.update.mockResolvedValue({});

      // Act
      const result = await service.createTransaction(userId, createTransactionDto);

      // Assert
      expect(mockPrismaService.categories.findUnique).toHaveBeenCalledWith({
        where: { id: BigInt(createTransactionDto.categoryId) },
      });
      expect(mockPrismaService.transactions.create).toHaveBeenCalledWith({
        data: {
          userId,
          categoryId: BigInt(createTransactionDto.categoryId),
          amount: createTransactionDto.amount,
          description: createTransactionDto.description,
          created_at: expect.any(Date),
        },
      });
      expect(mockPrismaService.users.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          current_balance: {
            decrement: createTransactionDto.amount,
          },
          updated_at: expect.any(Date),
        },
      });
      expect(result).toEqual({
        ...mockTransaction,
        id: String(mockTransaction.id),
        categoryId: String(mockTransaction.categoryId)
      });
    });

    it('should create a transaction for income category and increase user balance', async () => {
      // Arrange
      const userId = '123';
      const createTransactionDto: CreateTransactionDto = {
        categoryId: '456',
        amount: 200,
        description: 'Test income'
      };
      
      const mockCategory = {
        id: BigInt(456),
        name: 'Test Category',
        type: TransactionType.INCOME,
        userId: BigInt(123)
      };

      const mockTransaction = {
        id: BigInt(789),
        userId: BigInt(123),
        categoryId: BigInt(456),
        amount: new Decimal(200),
        description: 'Test income',
        created_at: new Date()
      };

      mockPrismaService.categories.findUnique.mockResolvedValue(mockCategory);
      mockPrismaService.transactions.create.mockResolvedValue(mockTransaction);
      mockPrismaService.users.update.mockResolvedValue({});

      // Act
      const result = await service.createTransaction(userId, createTransactionDto);

      // Assert
      expect(mockPrismaService.categories.findUnique).toHaveBeenCalledWith({
        where: { id: BigInt(createTransactionDto.categoryId) },
      });
      expect(mockPrismaService.transactions.create).toHaveBeenCalledWith({
        data: {
          userId,
          categoryId: BigInt(createTransactionDto.categoryId),
          amount: createTransactionDto.amount,
          description: createTransactionDto.description,
          created_at: expect.any(Date),
        },
      });
      expect(mockPrismaService.users.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          current_balance: {
            increment: createTransactionDto.amount,
          },
          updated_at: expect.any(Date),
        },
      });
      expect(result).toEqual({
        ...mockTransaction,
        id: String(mockTransaction.id),
        categoryId: String(mockTransaction.categoryId)
      });
    });

    it('should throw NotFoundException when category does not exist', async () => {
      // Arrange
      const userId = '123';
      const createTransactionDto: CreateTransactionDto = {
        categoryId: '456',
        amount: 100,
        description: 'Test transaction'
      };
      
      mockPrismaService.categories.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.createTransaction(userId, createTransactionDto)).rejects.toThrow(
        new NotFoundException(`Category with ID ${createTransactionDto.categoryId} not found`),
      );
      expect(mockPrismaService.transactions.create).not.toHaveBeenCalled();
      expect(mockPrismaService.users.update).not.toHaveBeenCalled();
    });
  });

  describe('updateTransaction', () => {
    it('should update a transaction and adjust user balance based on amount difference', async () => {
      // Arrange
      const userId = '123';
      const transactionId = '789';
      const updateTransactionDto = {
        amount: 150, // New amount, assuming original amount was 100
        description: 'Updated description'
      };

      const originalTransaction = {
        id: BigInt(789),
        userId,
        categoryId: BigInt(456),
        amount: new Decimal(100),
        description: 'Original description',
        created_at: new Date()
      };

      const updatedTransaction = {
        ...originalTransaction,
        amount: new Decimal(150),
        description: 'Updated description'
      };

      const mockCategory = {
        id: BigInt(456),
        name: 'Test Category',
        type: TransactionType.EXPENSE,
        userId: BigInt(123)
      };

      mockPrismaService.transactions.findFirst.mockResolvedValue(originalTransaction);
      mockPrismaService.categories.findUnique.mockResolvedValue(mockCategory);
      mockPrismaService.transactions.update.mockResolvedValue(updatedTransaction);
      mockPrismaService.users.update.mockResolvedValue({});

      // Act
      const result = await service.updateTransaction(userId, transactionId, updateTransactionDto);

      // Assert
      expect(mockPrismaService.transactions.findFirst).toHaveBeenCalledWith({
        where: {
          id: BigInt(transactionId),
          userId,
        },
      });
      expect(mockPrismaService.categories.findUnique).toHaveBeenCalledWith({
        where: { id: BigInt(originalTransaction.categoryId) },
      });
      expect(mockPrismaService.transactions.update).toHaveBeenCalledWith({
        where: { id: BigInt(transactionId) },
        data: updateTransactionDto,
      });
      expect(mockPrismaService.users.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          current_balance: {
            increment: -50, // Additional expense decreases balance (150-100=-50)
          },
          updated_at: expect.any(Date),
        },
      });
      expect(result).toEqual({
        ...updatedTransaction,
        id: String(updatedTransaction.id),
        categoryId: String(updatedTransaction.categoryId)
      });
    });

    it('should throw NotFoundException when transaction does not exist', async () => {
      // Arrange
      const userId = '123';
      const transactionId = '789';
      const updateTransactionDto = {
        amount: 150,
        description: 'Updated description'
      };

      mockPrismaService.transactions.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(service.updateTransaction(userId, transactionId, updateTransactionDto)).rejects.toThrow(
        new NotFoundException(`Transaction with ID ${transactionId} not found`),
      );
      expect(mockPrismaService.transactions.update).not.toHaveBeenCalled();
      expect(mockPrismaService.users.update).not.toHaveBeenCalled();
    });
  });

  describe('findAllByUser', () => {
    it('should return all transactions for a user', async () => {
      // Arrange
      const userId = '123';
      const mockTransactions = [
        {
          id: BigInt(789),
          userId,
          categoryId: BigInt(456),
          amount: new Decimal(100),
          description: 'Transaction 1',
          created_at: new Date(),
          category: {
            id: BigInt(456),
            name: 'Category 1',
            type: TransactionType.EXPENSE
          }
        },
        {
          id: BigInt(790),
          userId,
          categoryId: BigInt(457),
          amount: new Decimal(200),
          description: 'Transaction 2',
          created_at: new Date(),
          category: {
            id: BigInt(457),
            name: 'Category 2',
            type: TransactionType.INCOME
          }
        }
      ];

      mockPrismaService.transactions.findMany.mockResolvedValue(mockTransactions);

      // Act
      const result = await service.getAllTransactions(userId);

      // Assert
      expect(mockPrismaService.transactions.findMany).toHaveBeenCalledWith({
        where: { userId },
        include: { category: true },
        orderBy: { created_at: 'desc' },
      });
      expect(result).toEqual(mockTransactions.map(transaction => ({
        ...transaction,
        id: String(transaction.id),
        categoryId: String(transaction.categoryId),
        amount: Number(transaction.amount),
        category: {
          ...transaction.category,
          id: String(transaction.category.id)
        }
      })));
    });
  });

  describe('findOne', () => {
    it('should return a transaction by ID', async () => {
      // Arrange
      const userId = '123';
      const transactionId = '789';
      const mockTransaction = {
        id: BigInt(789),
        userId,
        categoryId: BigInt(456),
        amount: new Decimal(100),
        description: 'Test transaction',
        created_at: new Date(),
        category: {
          id: BigInt(456),
          name: 'Test Category',
          type: TransactionType.EXPENSE
        }
      };

      mockPrismaService.transactions.findFirst.mockResolvedValue(mockTransaction);

      // Act
      const result = await service.getTransactionById(userId, transactionId);

      // Assert
      expect(mockPrismaService.transactions.findFirst).toHaveBeenCalledWith({
        where: {
          id: BigInt(transactionId),
          userId,
        },
        include: { category: true },
      });
      expect(result).toEqual({
        ...mockTransaction,
        id: String(mockTransaction.id),
        categoryId: String(mockTransaction.categoryId),
        amount: Number(mockTransaction.amount),
        category: {
          ...mockTransaction.category,
          id: String(mockTransaction.category.id)
        }
      });
    });

    it('should throw NotFoundException when transaction does not exist', async () => {
      // Arrange
      const userId = '123';
      const transactionId = '789';
      
      mockPrismaService.transactions.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getTransactionById(userId, transactionId)).rejects.toThrow(
        new NotFoundException(`Transaction with ID ${transactionId} not found`),
      );
    });
  });
});