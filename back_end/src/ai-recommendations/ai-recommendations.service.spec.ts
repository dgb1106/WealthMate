import { Test, TestingModule } from '@nestjs/testing';
import { AiRecommendationsService } from './ai-recommendations.service';

describe('AiRecommendationsService', () => {
  let service: AiRecommendationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AiRecommendationsService],
    }).compile();

    service = module.get<AiRecommendationsService>(AiRecommendationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
