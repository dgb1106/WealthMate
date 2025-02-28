import { Test, TestingModule } from '@nestjs/testing';
import { RecurringTransactionsController } from './recurring-transactions.controller';

describe('RecurringTransactionsController', () => {
  let controller: RecurringTransactionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecurringTransactionsController],
    }).compile();

    controller = module.get<RecurringTransactionsController>(RecurringTransactionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
