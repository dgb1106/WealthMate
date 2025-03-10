import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { TransactionService } from './transaction.service';
import { PrismaService } from '../../prisma/prisma.service';
import { TransactionRepository } from '../repositories/transaction-repository.interface';
import { TransactionDomainService } from './transaction-domain.service';
import { Transaction } from '../entities/transaction.entity';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { UpdateTransactionDto } from '../dto/update-transaction.dto';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { TransactionType } from '../../common/enums/enum';
import { Decimal } from '@prisma/client/runtime/library';

describe('TransactionService', () => {
  let service: TransactionService;
  let prismaService: PrismaService;
  let cacheManager: any;
  let transactionRepository: jest.Mocked<TransactionRepository>;
  let transactionDomainService: jest.Mocked<TransactionDomainService>;

  const mockUser = { id: 'user-1', current_balance: new Decimal(1000) };
  const mockCategory = { id: BigInt(1), name: 'Food', type: TransactionType.EXPENSE };
  const mockTransaction = new Transaction({
    id: '1',
    userId: mockUser.id,
    categoryId: '1',
    amount: -50,
    description: 'Groceries',
    created_at: new Date()
  });

  beforeEach(async () => {
    // Create mocks for all dependencies
    const prismaServiceMock = {
      $transaction: jest.fn((callback) => callback({
        users: {
          update: jest.fn().mockResolvedValue({ current_balance: new Decimal(950) }),
        },
        categories: {
          findUnique: jest.fn().mockResolvedValue(mockCategory),
        },
        transactions: {
          findFirst: jest.fn().mockResolvedValue({
            id: BigInt(1),
            userId: mockUser.id,
            categoryId: BigInt(1),
            amount: -50,
            description: 'Groceries',
            created_at: new Date(),
            category: mockCategory
          }),
        },
      })),
      users: {
        update: jest.fn(),
      },
      categories: {
        findUnique: jest.fn(),
      },
    };

    const cacheManagerMock = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    const transactionRepositoryMock = {
      create: jest.fn(),
      findById: jest.fn(),
      findAllByUser: jest.fn(),
      findAllByUserForDateRange: jest.fn(),
      findAllByUserAndCategory: jest.fn(),
      findAllIncomeByUser: jest.fn(),
      findAllExpensesByUser: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      getSummaryByCategory: jest.fn(),
      getTotalAmountByCategoryForUser: jest.fn(),
    };

    const transactionDomainServiceMock = {
      validateDateRange: jest.fn(),
      validateAmount: jest.fn(),
      validateMonth: jest.fn(),
      calculateBalanceEffect: jest.fn().mockReturnValue(-50),
      formatTransactionAmount: jest.fn().mockReturnValue(-50),
      getMonthRange: jest.fn().mockReturnValue({
        firstDay: new Date('2023-01-01'),
        lastDay: new Date('2023-01-31'),
      }),
      getCurrentMonthRange: jest.fn().mockReturnValue({
        firstDay: new Date('2023-01-01'),
        lastDay: new Date('2023-01-31'),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        { provide: PrismaService, useValue: prismaServiceMock },
        { provide: CACHE_MANAGER, useValue: cacheManagerMock },
        { provide: TransactionRepository, useValue: transactionRepositoryMock },
        { provide: TransactionDomainService, useValue: transactionDomainServiceMock },
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
    prismaService = module.get<PrismaService>(PrismaService);
    cacheManager = module.get(CACHE_MANAGER);
    transactionRepository = module.get(TransactionRepository) as jest.Mocked<TransactionRepository>;
    transactionDomainService = module.get(TransactionDomainService) as jest.Mocked<TransactionDomainService>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createTransaction', () => {
    it('should create a transaction and update user balance', async () => {
      // Arrange
      const createDto: CreateTransactionDto = {
        categoryId: '1',
        amount: 50,
        description: 'Groceries',
      };

      transactionRepository.create.mockResolvedValue(mockTransaction);

      // Act
      const result = await service.createTransaction(mockUser.id, createDto);

      // Assert
      expect(transactionDomainService.validateAmount).toHaveBeenCalledWith(createDto.amount);
      expect(transactionDomainService.calculateBalanceEffect).toHaveBeenCalled();
      expect(transactionDomainService.formatTransactionAmount).toHaveBeenCalled();
      expect(transactionRepository.create).toHaveBeenCalledWith(
        mockUser.id,
        createDto.categoryId,
        -50,
        createDto.description
      );
      expect(cacheManager.del).toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining({
        ...mockTransaction,
        newBalance: expect.any(Decimal)
      }));
    });

    it('should throw NotFoundException if category is not found', async () => {
      // Arrange
      const createDto: CreateTransactionDto = {
        categoryId: '999',
        amount: 50,
        description: 'Groceries',
      };

      jest.spyOn(prismaService, '$transaction').mockImplementationOnce(async (callback) => {
        return callback({
          categories: {
            findUnique: jest.fn().mockResolvedValue(null),
          },
          users: { update: jest.fn() },
          transactions: { findFirst: jest.fn() }
        });
      });

      // Act & Assert
      await expect(service.createTransaction(mockUser.id, createDto))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('getAllTransactions', () => {
    it('should return cached transactions if available', async () => {
      // Arrange
      const cachedTransactions = [mockTransaction];
      cacheManager.get.mockResolvedValue(cachedTransactions);

      // Act
      const result = await service.getAllTransactions(mockUser.id);

      // Assert
      expect(cacheManager.get).toHaveBeenCalled();
      expect(transactionRepository.findAllByUser).not.toHaveBeenCalled();
      expect(result).toEqual(cachedTransactions);
    });

    it('should fetch and cache transactions if not cached', async () => {
      // Arrange
      const transactions = [mockTransaction];
      cacheManager.get.mockResolvedValue(null);
      transactionRepository.findAllByUser.mockResolvedValue(transactions);

      // Act
      const result = await service.getAllTransactions(mockUser.id);

      // Assert
      expect(cacheManager.get).toHaveBeenCalled();
      expect(transactionRepository.findAllByUser).toHaveBeenCalledWith(mockUser.id);
      expect(cacheManager.set).toHaveBeenCalled();
      expect(result).toEqual(transactions);
    });
  });

  describe('getTransactionById', () => {
    it('should return transaction by id', async () => {
      // Arrange
      transactionRepository.findById.mockResolvedValue(mockTransaction);

      // Act
      const result = await service.getTransactionById('1', mockUser.id);

      // Assert
      expect(transactionRepository.findById).toHaveBeenCalledWith('1', mockUser.id);
      expect(result).toEqual(mockTransaction);
    });

    it('should throw NotFoundException if transaction is not found', async () => {
      // Arrange
      transactionRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getTransactionById('999', mockUser.id))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('getCurrentMonthTransactions', () => {
    it('should return transactions for current month', async () => {
      // Arrange
      const transactions = [mockTransaction];
      cacheManager.get.mockResolvedValue(null);
      transactionRepository.findAllByUserForDateRange.mockResolvedValue(transactions);

      // Act
      const result = await service.getCurrentMonthTransactions(mockUser.id);

      // Assert
      expect(transactionDomainService.getCurrentMonthRange).toHaveBeenCalled();
      expect(transactionRepository.findAllByUserForDateRange).toHaveBeenCalledWith(
        mockUser.id,
        expect.any(Date),
        expect.any(Date)
      );
      expect(result).toEqual(transactions);
    });
  });

  describe('updateTransaction', () => {
    it('should update a transaction and adjust user balance', async () => {
      // Arrange
      const updateDto: UpdateTransactionDto = {
        amount: 75,
        description: 'Updated groceries',
      };
      
      const updatedTransaction = { ...mockTransaction, amount: -75, description: 'Updated groceries' };
      transactionRepository.update.mockResolvedValue(updatedTransaction);

      // Act
      const result = await service.updateTransaction(mockUser.id, '1', updateDto);

      // Assert
      expect(transactionDomainService.validateAmount).toHaveBeenCalledWith(updateDto.amount);
      expect(transactionRepository.update).toHaveBeenCalled();
      expect(cacheManager.del).toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining({
        ...updatedTransaction,
        newBalance: expect.any(Decimal)
      }));
    });
  });

  describe('deleteTransaction', () => {
    it('should delete a transaction and adjust user balance', async () => {
      // Arrange
      transactionRepository.delete.mockResolvedValue(true);

      // Act
      const result = await service.deleteTransaction(mockUser.id, '1');

      // Assert
      expect(transactionRepository.delete).toHaveBeenCalledWith('1', mockUser.id);
      expect(cacheManager.del).toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining({
        message: expect.any(String),
        newBalance: expect.any(Decimal)
      }));
    });
  });

  describe('getTransactionSummaryByCategory', () => {
    it('should return transaction summary by category', async () => {
      // Arrange
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-01-31');
      const summary = [{ category: mockCategory, totalAmount: -100 }];
      
      cacheManager.get.mockResolvedValue(null);
      transactionRepository.getSummaryByCategory.mockResolvedValue(summary);

      // Act
      const result = await service.getTransactionSummaryByCategory(mockUser.id, startDate, endDate);

      // Assert
      expect(transactionDomainService.validateDateRange).toHaveBeenCalledWith(startDate, endDate);
      expect(transactionRepository.getSummaryByCategory).toHaveBeenCalledWith(
        mockUser.id,
        startDate,
        endDate
      );
      expect(result).toEqual(summary);
    });
  });
  
  describe('getCategoryTotal', () => {
    it('should return total amount for a category', async () => {
      // Arrange
      const categoryId = '1';
      const totalAmount = -150;
      
      jest.spyOn(prismaService, 'categories').mockImplementation(() => ({
        findUnique: jest.fn().mockResolvedValue(mockCategory)
      } as any));
      
      transactionRepository.getTotalAmountByCategoryForUser.mockResolvedValue(totalAmount);

      // Act
      const result = await service.getCategoryTotal(mockUser.id, categoryId);

      // Assert
      expect(transactionRepository.getTotalAmountByCategoryForUser).toHaveBeenCalledWith(
        mockUser.id,
        categoryId
      );
      expect(result).toEqual(totalAmount);
    });

    it('should throw NotFoundException if category is not found', async () => {
      // Arrange
      const categoryId = '999';
      
      jest.spyOn(prismaService, 'categories').mockImplementation(() => ({
        findUnique: jest.fn().mockResolvedValue(null)
      } as any));

      // Act & Assert
      await expect(service.getCategoryTotal(mockUser.id, categoryId))
        .rejects.toThrow(NotFoundException);
    });
  });
});
