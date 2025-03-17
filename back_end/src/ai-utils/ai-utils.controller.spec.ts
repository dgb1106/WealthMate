import { Test, TestingModule } from '@nestjs/testing';
import { AiUtilsController } from './ai-utils.controller';

describe('AiUtilsController', () => {
  let controller: AiUtilsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiUtilsController],
    }).compile();

    controller = module.get<AiUtilsController>(AiUtilsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
