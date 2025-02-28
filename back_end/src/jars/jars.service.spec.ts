import { Test, TestingModule } from '@nestjs/testing';
import { JarsService } from './jars.service';

describe('JarsService', () => {
  let service: JarsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JarsService],
    }).compile();

    service = module.get<JarsService>(JarsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
