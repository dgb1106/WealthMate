import { Test, TestingModule } from '@nestjs/testing';
import { AiUtilsService } from './ai-utils.service';

describe('AiRecommendationsService', () => {
  let service: AiUtilsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AiUtilsService],
    }).compile();

    service = module.get<AiUtilsService>(AiUtilsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
