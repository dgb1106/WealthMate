import { Test, TestingModule } from '@nestjs/testing';
import { RecurringTransactionsService } from './recurring-transactions.service';

describe('RecurringTransactionsService', () => {
  let service: RecurringTransactionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RecurringTransactionsService],
    }).compile();

    service = module.get<RecurringTransactionsService>(RecurringTransactionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
