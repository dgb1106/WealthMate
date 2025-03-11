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

const mockCacheManager = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  reset: jest.fn(),
};

const mockTransactionDomainService = {
  validateDateRange: jest.fn(),
  calculateTransactionAmount: jest.fn(),
  validateAmount: jest.fn(),
  validateMonth: jest.fn(),
  calculateBalanceEffect: jest.fn((amount, type) => {
    if (type === TransactionType.EXPENSE) {
      return -Math.abs(Number(amount));
    }
    return Math.abs(Number(amount));
  }),
  formatTransactionAmount: jest.fn((amount, type) => {
    if (type === TransactionType.EXPENSE) {
      return -Math.abs(Number(amount));
    }
    return Math.abs(Number(amount));
  }),
  getMonthRange: jest.fn(),
  getCurrentMonthRange: jest.fn(),
};

// Update mockTransactionRepository implementation
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: 'CACHE_MANAGER',
          useValue: mockCacheManager,
        },
        {
          provide: 'TRANSACTION_REPOSITORY',
          useValue: mockTransactionRepository,
        },
        {
          provide: TransactionDomainService,
          useValue: mockTransactionDomainService,
        },
      ],
    }).compile();
    service = module.get<TransactionService>(TransactionService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('createTransaction', () => {
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

      mockPrismaService.categories.findUnique.mockResolvedValue(mockCategory);
      mockTransactionDomainService.calculateBalanceEffect.mockReturnValue(-100);
      mockTransactionDomainService.formatTransactionAmount.mockReturnValue(-100);
      mockPrismaService.users.update.mockResolvedValue({ current_balance: 900 });

      // Act
      const result = await service.createTransaction(userId, createTransactionDto);

      // Assert
      expect(mockPrismaService.categories.findUnique).toHaveBeenCalledWith({
        where: { id: BigInt(createTransactionDto.categoryId) },
      });
      expect(mockTransactionDomainService.calculateBalanceEffect).toHaveBeenCalledWith(
        createTransactionDto.amount,
        TransactionType.EXPENSE
      );
      expect(mockTransactionRepository.create).toHaveBeenCalledWith(
        userId,
        createTransactionDto.categoryId,
        -100, // Formatted amount from domain service
        createTransactionDto.description
      );
      expect(mockPrismaService.users.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          current_balance: {
            increment: -100,
          },
          updated_at: expect.any(Date),
        },
        select: {
          current_balance: true
        }
      });
      expect(mockCacheManager.del).toHaveBeenCalled();
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

      mockPrismaService.categories.findUnique.mockResolvedValue(mockCategory);
      mockTransactionDomainService.calculateBalanceEffect.mockReturnValue(200);
      mockTransactionDomainService.formatTransactionAmount.mockReturnValue(200);
      mockPrismaService.users.update.mockResolvedValue({ current_balance: 1200 });

      // Act
      const result = await service.createTransaction(userId, createTransactionDto);

      // Assert
      expect(mockPrismaService.categories.findUnique).toHaveBeenCalledWith({
        where: { id: BigInt(createTransactionDto.categoryId) },
      });
      expect(mockTransactionDomainService.calculateBalanceEffect).toHaveBeenCalledWith(
        createTransactionDto.amount,
        TransactionType.INCOME
      );
      expect(mockTransactionRepository.create).toHaveBeenCalledWith(
        userId,
        createTransactionDto.categoryId,
        200, // Formatted amount from domain service
        createTransactionDto.description
      );
      expect(mockPrismaService.users.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          current_balance: {
            increment: 200,
          },
          updated_at: expect.any(Date),
        },
        select: {
          current_balance: true
        }
      });
      expect(mockCacheManager.del).toHaveBeenCalled();
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
      expect(mockTransactionRepository.create).not.toHaveBeenCalled();
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

      const mockCategory = {
        id: BigInt(456),
        name: 'Test Category',
        type: TransactionType.EXPENSE,
        userId: BigInt(123)
      };

      mockPrismaService.transactions.findFirst.mockResolvedValue(originalTransaction);
      mockPrismaService.categories.findUnique.mockResolvedValue(mockCategory);
      mockTransactionDomainService.formatTransactionAmount.mockReturnValue(-150);
      mockPrismaService.users.update.mockResolvedValue({ current_balance: 850 });

      // Act
      const result = await service.updateTransaction(userId, transactionId, updateTransactionDto);

      // Assert
      expect(mockPrismaService.transactions.findFirst).toHaveBeenCalledWith({
        where: {
          id: BigInt(transactionId),
          userId,
        },
        include: {
          category: true
        }
      });
      expect(mockPrismaService.categories.findUnique).toHaveBeenCalledWith({
        where: { id: BigInt(originalTransaction.categoryId) },
      });
      expect(mockTransactionRepository.update).toHaveBeenCalledWith(
        transactionId,
        userId,
        {
          amount: -150,
          description: 'Updated description'
        }
      );
      expect(mockPrismaService.users.update).toHaveBeenCalled();
      expect(mockCacheManager.del).toHaveBeenCalled();
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
      expect(mockTransactionRepository.update).not.toHaveBeenCalled();
      expect(mockPrismaService.users.update).not.toHaveBeenCalled();
    });
  });

  describe('getAllTransactions', () => {
    it('should return all transactions for a user', async () => {
      // Arrange
      const userId = '123';
      const mockTransactions = [
        {
          id: '789',
          userId,
          categoryId: '456',
          amount: 100,
          description: 'Transaction 1',
          created_at: new Date()
        },
        {
          id: '790',
          userId,
          categoryId: '457',
          amount: 200,
          description: 'Transaction 2',
          created_at: new Date()
        }
      ];

      mockCacheManager.get.mockResolvedValue(null);
      mockTransactionRepository.findAllByUser.mockResolvedValue(mockTransactions);

      // Act
      const result = await service.getAllTransactions(userId);

      // Assert
      expect(mockCacheManager.get).toHaveBeenCalled();
      expect(mockTransactionRepository.findAllByUser).toHaveBeenCalledWith(userId);
      expect(mockCacheManager.set).toHaveBeenCalled();
      expect(result).toEqual(mockTransactions);
    });
  });

  describe('getTransactionById', () => {
    it('should return a transaction by ID', async () => {
      // Arrange
      const userId = '123';
      const transactionId = '789';
      const mockTransaction = {
        id: '789',
        userId,
        categoryId: '456',
        amount: 100,
        description: 'Test transaction',
        created_at: new Date()
      };

      mockCacheManager.get.mockResolvedValue(null);
      mockTransactionRepository.findById.mockResolvedValue(mockTransaction);

      // Act
      const result = await service.getTransactionById(userId, transactionId);

      // Assert
      expect(mockCacheManager.get).toHaveBeenCalled();
      expect(mockTransactionRepository.findById).toHaveBeenCalledWith(transactionId, userId);
      expect(mockCacheManager.set).toHaveBeenCalled();
      expect(result).toEqual(mockTransaction);
    });

    it('should throw NotFoundException when transaction does not exist', async () => {
      // Arrange
      const userId = '123';
      const transactionId = '789';
      
      mockCacheManager.get.mockResolvedValue(null);
      mockTransactionRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getTransactionById(userId, transactionId)).rejects.toThrow(
        new NotFoundException(`Transaction with ID ${transactionId} not found`),
      );
    });
  });
});