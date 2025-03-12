import { User } from '../entities/users.entity';
import { RegisterDto } from '../../auth/dto/register.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

export interface UsersRepository {
  createUser(registerDto: RegisterDto, hashedPassword: string): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  update(id: string, updateUserDto: UpdateUserDto): Promise<User>;
  delete(id: string): Promise<void>;
  updateBalance(id: string, amount: number): Promise<User>;
  updatePassword(userId: string, hashedPassword: string): Promise<{ success: boolean }>;
  deleteAllUserTokens(userId: string): Promise<void>;
  getUserPasswordHash(userId: string): Promise<string | null>;
}
