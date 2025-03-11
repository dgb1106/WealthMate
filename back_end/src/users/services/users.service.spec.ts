import { PrismaService } from '../../prisma/prisma.service';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;

  // Mock user data
  const mockUser = {
    id: 'test-uuid',
    name: 'Test User',
    email: 'test@example.com',
    phone: '0123456789',
    city: 'Hanoi',
    district: 'Cau Giay',
    job: 'Developer',
    preferred_mood: 'HAPPY',
    preferred_goal: 'EDUCATION',
    hash_password: 'hashedpassword123',
    current_balance: 1000,
    create_at: new Date(),
    updated_at: new Date(),
  };

  // Create mock for PrismaService
  const mockPrismaService = {
    users: {
      findUnique: jest.fn()
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, {
        provide: PrismaService,
        useValue: mockPrismaService
      }],
    }).compile();

    prismaService = module.get<PrismaService>(PrismaService);
    service = module.get<UsersService>(UsersService);

    jest.clearAllMocks();
  });

  describe('getUserById', () => {
    it('should return a user by ID', async () => {
      const userId = 'test-uuid';
      mockPrismaService.users.findUnique.mockResolvedValue(mockUser);
      
      const result = await service.getUserById(userId);
      console.log(result);
      expect(result).toEqual(mockUser);
      expect(mockPrismaService.users.findUnique).toHaveBeenCalledWith({
        where: { id: userId }
      });
      expect(prismaService.users.findUnique).toHaveBeenCalledTimes(1);
    });

    it('should return null if user not found', async () => {
      const userId = 'non-existent-uuid';
      mockPrismaService.users.findUnique.mockResolvedValue(null);
      const result = await service.getUserById(userId);
      console.log(result);
      expect(result).toBeNull();
      expect(mockPrismaService.users.findUnique).toHaveBeenCalledWith({
        where: { id: userId }
        });
      });
    });
});

