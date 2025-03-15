import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import { TransactionType } from '../common/enums/enum';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Tạo một danh mục mới
   * @param createCategoryDto Dữ liệu để tạo danh mục
   * @returns Danh mục đã được tạo
   */
  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    // Kiểm tra xem danh mục có tồn tại chưa
    const existingCategory = await this.findByName(createCategoryDto.name);
    if (existingCategory) {
      throw new ConflictException(`Danh mục với tên "${createCategoryDto.name}" đã tồn tại`);
    }

    const category = await this.prisma.categories.create({
      data: {
        name: createCategoryDto.name,
        type: createCategoryDto.type
      }
    });

    return Category.fromPrisma(category);
  }

  /**
   * Lấy tất cả danh mục
   * @returns Danh sách các danh mục
   */
  async findAll(): Promise<Category[]> {
    const categories = await this.prisma.categories.findMany({
      orderBy: { name: 'asc' }
    });

    return categories.map(category => Category.fromPrisma(category));
  }

  /**
   * Lấy danh mục theo ID
   * @param id ID của danh mục
   * @returns Danh mục được tìm thấy
   */
  async findOne(id: string): Promise<Category> {
    const category = await this.prisma.categories.findUnique({
      where: {
        id: BigInt(id)
      }
    });

    if (!category) {
      throw new NotFoundException(`Danh mục với ID ${id} không tồn tại`);
    }

    return Category.fromPrisma(category);
  }

  /**
   * Lấy danh mục theo tên
   * @param name Tên danh mục
   * @returns Danh mục được tìm thấy hoặc null
   */
  async findByName(name: string): Promise<Category | null> {
    const category = await this.prisma.categories.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive'
        }
      }
    });

    return category ? Category.fromPrisma(category) : null;
  }

  /**
   * Lấy danh mục theo loại (thu nhập/chi tiêu)
   * @param type Loại danh mục (INCOME/EXPENSE)
   * @returns Danh sách các danh mục
   */
  async findByType(type: TransactionType): Promise<Category[]> {
    const categories = await this.prisma.categories.findMany({
      where: {
        type
      },
      orderBy: { name: 'asc' }
    });

    return categories.map(category => Category.fromPrisma(category));
  }

  /**
   * Cập nhật thông tin danh mục
   * @param id ID của danh mục
   * @param updateCategoryDto Dữ liệu cập nhật
   * @returns Danh mục đã được cập nhật
   */
  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    // Kiểm tra xem danh mục có tồn tại không
    await this.findOne(id);

    // Kiểm tra xem tên mới có bị trùng với danh mục khác không
    if (updateCategoryDto.name) {
      const existingCategory = await this.prisma.categories.findFirst({
        where: {
          name: {
            equals: updateCategoryDto.name,
            mode: 'insensitive'
          },
          id: {
            not: BigInt(id)
          }
        }
      });

      if (existingCategory) {
        throw new ConflictException(`Danh mục với tên "${updateCategoryDto.name}" đã tồn tại`);
      }
    }

    const updateData: any = {};
    if (updateCategoryDto.name) updateData.name = updateCategoryDto.name;
    if (updateCategoryDto.type) updateData.type = updateCategoryDto.type;

    const updatedCategory = await this.prisma.categories.update({
      where: { id: BigInt(id) },
      data: updateData
    });

    return Category.fromPrisma(updatedCategory);
  }

  /**
   * Xóa một danh mục
   * @param id ID của danh mục
   * @returns Thông báo kết quả
   */
  async remove(id: string): Promise<{ message: string }> {
    // Kiểm tra xem danh mục có tồn tại không
    await this.findOne(id);

    // Kiểm tra xem danh mục có đang được sử dụng không
    const transactionCount = await this.prisma.transactions.count({
      where: { categoryId: BigInt(id) }
    });

    if (transactionCount > 0) {
      throw new ConflictException('Không thể xóa danh mục đang được sử dụng trong các giao dịch');
    }

    const recurringTransactionCount = await this.prisma.recurringTransactions.count({
      where: { categoryId: BigInt(id) }
    });

    if (recurringTransactionCount > 0) {
      throw new ConflictException('Không thể xóa danh mục đang được sử dụng trong các giao dịch định kỳ');
    }

    const budgetCount = await this.prisma.budgets.count({
      where: { categoryId: BigInt(id) }
    });

    if (budgetCount > 0) {
      throw new ConflictException('Không thể xóa danh mục đang được sử dụng trong ngân sách');
    }

    await this.prisma.categories.delete({
      where: { id: BigInt(id) }
    });

    return { message: 'Danh mục đã được xóa thành công' };
  }

  /**
   * Kiểm tra xem danh mục có tồn tại không
   * @param id ID của danh mục
   * @returns True nếu danh mục tồn tại, ngược lại là False
   */
  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.categories.count({
      where: {
        id: BigInt(id)
      }
    });

    return count > 0;
  }

  /**
   * Tìm danh mục theo tên, nếu không tồn tại thì tạo mới
   * @param name Tên danh mục
   * @param type Loại danh mục
   * @returns Danh mục tìm thấy hoặc đã tạo mới
   */
  async findOrCreate(name: string, type: TransactionType): Promise<Category> {
    // Tìm danh mục theo tên
    const existingCategory = await this.findByName(name);
    
    if (existingCategory) {
      return existingCategory;
    }

    // Nếu không tìm thấy, tạo mới
    return this.create({
      name,
      type
    });
  }
}
