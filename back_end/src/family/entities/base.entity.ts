export abstract class BaseEntity {
  /**
   * Creates an instance from Prisma data with type safety
   */
  static fromPrisma<T extends BaseEntity, P>(
    this: new (data: any) => T,
    prismaObject: P | null, 
    transformFn?: (data: P) => any
  ): T | null {
    if (!prismaObject) return null;
    
    const data = transformFn ? transformFn(prismaObject) : prismaObject;
    return new this(data);
  }

  /**
   * Creates instances from array of Prisma data with type safety
   */
  static fromPrismaArray<T extends BaseEntity, P>(
    this: new (data: any) => T,
    prismaObjects: P[], 
    transformFn?: (data: P) => any
  ): T[] {
    return prismaObjects.map(obj => {
      const data = transformFn ? transformFn(obj) : obj;
      return new this(data);
    });
  }
}
