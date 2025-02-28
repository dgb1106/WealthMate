import { Test, TestingModule } from '@nestjs/testing';
import { AiRecommendationsController } from './ai-recommendations.controller';

describe('AiRecommendationsController', () => {
  let controller: AiRecommendationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiRecommendationsController],
    }).compile();

    controller = module.get<AiRecommendationsController>(AiRecommendationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
