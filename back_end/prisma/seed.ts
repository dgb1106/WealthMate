import { PreferredMood, PreferredGoal, TransactionType } from "../src/common/enums/enum";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {

  // Xóa các categories hiện có (nếu cần)
  await prisma.categories.deleteMany({});

  // Thêm categories chi tiêu (EXPENSE)
  const expenseCategories = [
    "Ăn uống",
    "Nhà ở",
    "Di chuyển",
    "Giáo dục",
    "Quà tặng",
    "Hóa đơn & Tiện ích",
    "Mua sắm",
    "Làm đẹp",
    "Gia đình",
    "Vật nuôi",
    "Sức khỏe",
    "Giải trí",
    "Công việc",
    "Bảo hiểm",
    "Các chi phí khác",
    "Trả nợ",
    "Thể thao",
    "Đầu tư",
    "Gửi tiết kiệm",
    "Quỹ dự phòng",
  ];

  // Thêm categories thu nhập (INCOME)
  const incomeCategories = [
    "Lương", 
    "Thu nhập khác",
  ];

  let id = 1;
  // Chuẩn bị dữ liệu cho các categories chi tiêu
  const expenseCategoriesData = expenseCategories.map(name => ({
    id: id ++,
    name,
    type: TransactionType.EXPENSE
  }));

  // Chuẩn bị dữ liệu cho các categories thu nhập
  const incomeCategoriesData = incomeCategories.map(name => ({
    id: id ++,
    name,
    type: TransactionType.INCOME
  }));

  // Thêm tất cả categories trong một lần
  await prisma.categories.createMany({
    data: [...expenseCategoriesData, ...incomeCategoriesData],
    skipDuplicates: true, // Bỏ qua nếu đã tồn tại
  });

  console.log("✅ Categories added to database!");
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
