import { Test, TestingModule } from '@nestjs/testing';
import { JarsController } from './jars.controller';

describe('JarsController', () => {
  let controller: JarsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JarsController],
    }).compile();

    controller = module.get<JarsController>(JarsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
