import { TransactionType } from '../../common/enums/enum';

export class Category {
  id: string;
  name: string;
  type: TransactionType;
  
  constructor(partial: Partial<Category>) {
    Object.assign(this, partial);
  }
  
  /**
   * Chuyển đổi từ đối tượng Prisma sang Category entity
   * @param prismaCategory Đối tượng category từ Prisma
   * @returns Đối tượng Category
   */
  static fromPrisma(prismaCategory: any): Category {
    return new Category({
      id: String(prismaCategory.id),
      name: prismaCategory.name,
      type: prismaCategory.type as TransactionType
    });
  }
  
  /**
   * Chuyển đổi từ mảng đối tượng Prisma sang mảng Category entity
   * @param prismaCategories Mảng đối tượng category từ Prisma
   * @returns Mảng đối tượng Category
   */
  static fromPrismaArray(prismaCategories: any[]): Category[] {
    return prismaCategories.map(category => Category.fromPrisma(category));
  }
  
  /**
   * Định dạng category để trả về qua API
   */
  toResponseFormat(): any {
    return {
      id: this.id,
      name: this.name,
      type: this.type
    };
  }
}
