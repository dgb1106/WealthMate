import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { TransactionDomainService } from './transaction-domain.service';
import { TransactionType } from '../../common/enums/enum';
import { Decimal } from '@prisma/client/runtime/library';

describe('TransactionDomainService', () => {
  let service: TransactionDomainService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TransactionDomainService],
    }).compile();

    service = module.get<TransactionDomainService>(TransactionDomainService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateDateRange', () => {
    it('should not throw an error for valid date range', () => {
      // Arrange
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');

      // Act & Assert
      expect(() => service.validateDateRange(startDate, endDate)).not.toThrow();
    });

    it('should throw BadRequestException for invalid date range', () => {
      // Arrange
      const startDate = new Date('2025-01-31');
      const endDate = new Date('2025-01-01');

      // Act & Assert
      expect(() => service.validateDateRange(startDate, endDate))
        .toThrow(BadRequestException);
      expect(() => service.validateDateRange(startDate, endDate))
        .toThrow('Start date must be before end date');
    });

    it('should accept same start and end date', () => {
      // Arrange
      const sameDate = new Date('2023-01-15');
      
      // Act & Assert
      expect(() => service.validateDateRange(sameDate, sameDate)).not.toThrow();
    });
  });

  describe('validateAmount', () => {
    it('should not throw an error for valid numeric amount', () => {
      // Arrange
      const amount = 50;

      // Act & Assert
      expect(() => service.validateAmount(amount)).not.toThrow();
    });

    it('should not throw an error for valid Decimal amount', () => {
      // Arrange
      const amount = new Decimal(50.75);

      // Act & Assert
      expect(() => service.validateAmount(amount)).not.toThrow();
    });

    it('should throw BadRequestException for NaN amount', () => {
      // Arrange
      const amount = NaN;

      // Act & Assert
      expect(() => service.validateAmount(amount))
        .toThrow(BadRequestException);
      expect(() => service.validateAmount(amount))
        .toThrow('Amount must be a valid number');
    });

    it('should throw BadRequestException for non-numeric string converted to amount', () => {
      // Arrange
      const amount = Number('not-a-number');

      // Act & Assert
      expect(() => service.validateAmount(amount))
        .toThrow(BadRequestException);
    });
  });

  describe('validateMonth', () => {
    it('should not throw an error for month January (0)', () => {
      // Act & Assert
      expect(() => service.validateMonth(0)).not.toThrow();
    });

    it('should not throw an error for month December (11)', () => {
      // Act & Assert
      expect(() => service.validateMonth(11)).not.toThrow();
    });

    it('should throw BadRequestException for month less than 0', () => {
      // Act & Assert
      expect(() => service.validateMonth(-1))
        .toThrow(BadRequestException);
      expect(() => service.validateMonth(-1))
        .toThrow('Month must be between 0-11');
    });

    it('should throw BadRequestException for month greater than 11', () => {
      // Act & Assert
      expect(() => service.validateMonth(12))
        .toThrow(BadRequestException);
      expect(() => service.validateMonth(12))
        .toThrow('Month must be between 0-11');
    });
  });

  describe('calculateBalanceEffect', () => {
    it('should return positive value for income transaction', () => {
      // Arrange
      const amount = 100;
      const categoryType = TransactionType.INCOME;

      // Act
      const result = service.calculateBalanceEffect(amount, categoryType);

      // Assert
      expect(result).toBe(100);
    });

    it('should return negative value for expense transaction', () => {
      // Arrange
      const amount = 100;
      const categoryType = TransactionType.EXPENSE;

      // Act
      const result = service.calculateBalanceEffect(amount, categoryType);

      // Assert
      expect(result).toBe(-100);
    });

    it('should preserve negative sign', () => {
      // Arrange
      const amount = -50;
      const categoryType = TransactionType.INCOME;

      // Assert
      expect(() => service.calculateBalanceEffect(amount, categoryType))
        .toThrow(BadRequestException);
      expect(() => service.calculateBalanceEffect(amount, categoryType))
        .toThrow('Amount must be greater than 0');
    });

    it('should handle Decimal objects correctly for Expense', () => {
      // Arrange
      const amount = new Decimal(75.25);
      const categoryType = TransactionType.EXPENSE;

      // Act
      const result = service.calculateBalanceEffect(amount, categoryType);

      // Assert
      expect(result).toBe(-75.25);
    });

    it('should handle Decimal objects correctly for Income', () => {
      // Arrange
      const amount = new Decimal(109.123235);
      const categoryType = TransactionType.INCOME;

      // Act
      const result = service.calculateBalanceEffect(amount, categoryType);

      // Assert
      expect(result).toBe(109.123235);
    });

    it('should handle zero correctly', () => {
        // Arrange
        const amount = 0;

        // Assert
        expect(() => service.calculateBalanceEffect(amount, TransactionType.INCOME))
        .toThrow(BadRequestException);
        expect(() => service.calculateBalanceEffect(amount, TransactionType.EXPENSE))
        .toThrow(BadRequestException);
        expect(() => service.calculateBalanceEffect(amount, TransactionType.INCOME))
        .toThrow('Amount must be greater than 0');
        expect(() => service.calculateBalanceEffect(amount, TransactionType.EXPENSE))
        .toThrow('Amount must be greater than 0');
     });
  });

  describe('formatTransactionAmount', () => {
    it('should return positive amount for income transaction', () => {
      // Arrange
      const amount = 50;
      const categoryType = TransactionType.INCOME;

      // Act
      const result = service.formatTransactionAmount(amount, categoryType);

      // Assert
      expect(result).toBe(50);
    });

    it('should convert negative income to positive', () => {
      // Arrange
      const amount = -50; // User entered negative income
      const categoryType = TransactionType.INCOME;

      // Act
      const result = service.formatTransactionAmount(amount, categoryType);

      // Assert
      expect(result).toBe(50); // Should be stored as positive
    });

    it('should return negative amount for expense transaction', () => {
      // Arrange
      const amount = 50;
      const categoryType = TransactionType.EXPENSE;

      // Act
      const result = service.formatTransactionAmount(amount, categoryType);

      // Assert
      expect(result).toBe(-50);
    });

    it('should preserve negative sign for expense', () => {
      // Arrange
      const amount = -50; // User already entered negative expense
      const categoryType = TransactionType.EXPENSE;

      // Act
      const result = service.formatTransactionAmount(amount, categoryType);

      // Assert
      expect(result).toBe(-50); // Still negative
    });

    it('should handle zero correctly', () => {
      // Arrange
      const amount = 0;
      
      // Act
      const incomeResult = service.formatTransactionAmount(amount, TransactionType.INCOME);
      const expenseResult = service.formatTransactionAmount(amount, TransactionType.EXPENSE);
      
      // Assert
      expect(incomeResult).toBe(0);
      expect(expenseResult).toBe(0);
    });

    it('should handle Decimal objects correctly', () => {
      // Arrange
      const amount = new Decimal(75.25);
      const categoryType = TransactionType.EXPENSE;

      // Act
      const result = service.formatTransactionAmount(amount, categoryType);

      // Assert
      expect(result).toBe(-75.25);
    });
  });

  describe('getMonthRange', () => {
    it('should return correct date range for January', () => {
      // Arrange
      const month = 0; // January
      const year = 2023;

      // Act
      const result = service.getMonthRange(month, year);

      // Assert
      expect(result.firstDay).toEqual(new Date(2023, 0, 1));
      expect(result.lastDay).toEqual(new Date(2023, 1, 0, 23, 59, 59, 999));
    });

    it('should return correct date range for February in leap year', () => {
      // Arrange
      const month = 1; // February
      const year = 2024; // Leap year

      // Act
      const result = service.getMonthRange(month, year);

      // Assert
      expect(result.firstDay).toEqual(new Date(2024, 1, 1));
      expect(result.lastDay).toEqual(new Date(2024, 2, 0, 23, 59, 59, 999));
      expect(result.lastDay.getDate()).toBe(29); // February has 29 days in leap year
    });

    it('should return correct date range for December', () => {
      // Arrange
      const month = 11; // December
      const year = 2023;

      // Act
      const result = service.getMonthRange(month, year);

      // Assert
      expect(result.firstDay).toEqual(new Date(2023, 11, 1));
      expect(result.lastDay).toEqual(new Date(2023, 12, 0, 23, 59, 59, 999));
      expect(result.lastDay.getDate()).toBe(31); // December has 31 days
    });

    it('should set the time to start of day for firstDay', () => {
      // Arrange
      const month = 3; // April
      const year = 2023;

      // Act
      const result = service.getMonthRange(month, year);

      // Assert
      expect(result.firstDay.getHours()).toBe(0);
      expect(result.firstDay.getMinutes()).toBe(0);
      expect(result.firstDay.getSeconds()).toBe(0);
      expect(result.firstDay.getMilliseconds()).toBe(0);
    });

    it('should set the time to end of day for lastDay', () => {
      // Arrange
      const month = 3; // April
      const year = 2023;

      // Act
      const result = service.getMonthRange(month, year);

      // Assert
      expect(result.lastDay.getHours()).toBe(23);
      expect(result.lastDay.getMinutes()).toBe(59);
      expect(result.lastDay.getSeconds()).toBe(59);
      expect(result.lastDay.getMilliseconds()).toBe(999);
    });
  });

  describe('getCurrentMonthRange', () => {
    it('should call getMonthRange with current month and year', () => {
      // Arrange
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      const spy = jest.spyOn(service, 'getMonthRange');
      
      // Act
      service.getCurrentMonthRange();
      
      // Assert
      expect(spy).toHaveBeenCalledWith(currentMonth, currentYear);
    });

    it('should return correct date range for current month', () => {
      // Arrange
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      const expectedFirstDay = new Date(currentYear, currentMonth, 1);
      const expectedLastDay = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);
      
      // Act
      const result = service.getCurrentMonthRange();
      
      // Assert
      expect(result.firstDay.getFullYear()).toBe(expectedFirstDay.getFullYear());
      expect(result.firstDay.getMonth()).toBe(expectedFirstDay.getMonth());
      expect(result.firstDay.getDate()).toBe(expectedFirstDay.getDate());
      
      expect(result.lastDay.getFullYear()).toBe(expectedLastDay.getFullYear());
      expect(result.lastDay.getMonth()).toBe(expectedLastDay.getMonth());
      expect(result.lastDay.getDate()).toBe(expectedLastDay.getDate());
      expect(result.lastDay.getHours()).toBe(23);
      expect(result.lastDay.getMinutes()).toBe(59);
      expect(result.lastDay.getSeconds()).toBe(59);
    });
  });
});
