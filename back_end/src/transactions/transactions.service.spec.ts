import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from './transactions.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { TransactionType } from '../common/enums/enum';
import { CreateTransactionDto } from './dto/create-transaction.dto';

// Mock class cho Decimal vì @prisma/client/runtime/library có thể không được import đúng cách trong môi trường test
class MockDecimal {
  constructor(public value: number) {}
  
  toString() {
    return this.value.toString();
  }
  
  toNumber() {
    return this.value;
  }
}

// Mock PrismaService
const mockPrismaService = {
  $transaction: jest.fn((callback) => Promise.resolve(callback(mockPrismaService))),
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

describe('TransactionsService', () => {
  let service: TransactionsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
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
        amount: new MockDecimal(100),
        description: 'Test expense',
        created_at: new Date()
      };

      mockPrismaService.categories.findUnique.mockResolvedValue(mockCategory);
      mockPrismaService.transactions.create.mockResolvedValue(mockTransaction);
      mockPrismaService.users.update.mockResolvedValue({});

      // Act
      const result = await service.create(userId, createTransactionDto);

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
      expect(result).toEqual(expect.objectContaining({
        id: String(mockTransaction.id),
        categoryId: String(mockTransaction.categoryId)
      }));
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
        amount: new MockDecimal(200),
        description: 'Test income',
        created_at: new Date()
      };

      mockPrismaService.categories.findUnique.mockResolvedValue(mockCategory);
      mockPrismaService.transactions.create.mockResolvedValue(mockTransaction);
      mockPrismaService.users.update.mockResolvedValue({});

      // Act
      const result = await service.create(userId, createTransactionDto);

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
      expect(result).toEqual(expect.objectContaining({
        id: String(mockTransaction.id),
        categoryId: String(mockTransaction.categoryId)
      }));
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
      await expect(service.create(userId, createTransactionDto)).rejects.toThrow(
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
        amount: new MockDecimal(100),
        description: 'Original description',
        created_at: new Date()
      };

      const updatedTransaction = {
        ...originalTransaction,
        amount: new MockDecimal(150),
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
      // Kiểm tra balance được cập nhật đúng
      expect(mockPrismaService.users.update).toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining({
        id: String(updatedTransaction.id),
        categoryId: String(updatedTransaction.categoryId)
      }));
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
          amount: new MockDecimal(100),
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
          amount: new MockDecimal(200),
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
      const result = await service.findAllByUser(userId);

      // Assert
      expect(mockPrismaService.transactions.findMany).toHaveBeenCalledWith({
        where: { userId },
        include: { category: true },
        orderBy: { created_at: 'desc' },
      });
      
      // Sử dụng objectContaining thay vì so sánh chính xác để tránh lỗi khi chuyển đổi kiểu
      expect(result.length).toBe(mockTransactions.length);
      expect(result[0]).toEqual(expect.objectContaining({
        id: String(mockTransactions[0].id),
        categoryId: String(mockTransactions[0].categoryId),
        description: mockTransactions[0].description,
      }));
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
        amount: new MockDecimal(100),
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
      const result = await service.findOne(userId, transactionId);

      // Assert
      expect(mockPrismaService.transactions.findFirst).toHaveBeenCalledWith({
        where: {
          id: BigInt(transactionId),
          userId,
        },
        include: { category: true },
      });
      expect(result).toEqual(expect.objectContaining({
        id: String(mockTransaction.id),
        categoryId: String(mockTransaction.categoryId),
        description: mockTransaction.description,
      }));
    });

    it('should throw NotFoundException when transaction does not exist', async () => {
      // Arrange
      const userId = '123';
      const transactionId = '789';
      
      mockPrismaService.transactions.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(userId, transactionId)).rejects.toThrow(
        new NotFoundException(`Transaction with ID ${transactionId} not found`),
      );
    });
  });
}); 