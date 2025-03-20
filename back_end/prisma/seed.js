"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const enum_1 = require("../src/common/enums/enum");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    await prisma.users.createMany({
        data: [
            {
                id: "550e8400-e29b-41d4-a716-446655440000",
                name: "John Doe",
                email: "john@example.com",
                phone: "123456789",
                city: "Hanoi",
                district: "HoanKiem",
                job: "Software Engineer",
                preferred_mood: enum_1.PreferredMood.IRRITATION,
                preferred_goal: enum_1.PreferredGoal.SAVING,
                hash_password: "$2b$10$KIXaC1OZKixG8hhZ/ICbpuIbXG",
                current_balance: 1000.50,
                create_at: new Date(),
                updated_at: new Date(),
            },
            {
                id: "660e8400-e29b-41d4-a716-446655440111",
                name: "Alice Smith",
                email: "alice@example.com",
                phone: "987654321",
                city: "Hanoi",
                district: "HoaiDuc",
                job: "Designer",
                preferred_mood: enum_1.PreferredMood.ENCOURAGEMENT,
                preferred_goal: enum_1.PreferredGoal.SAVING,
                hash_password: "$2b$10$KIXaC1OZKixG8hhZ/ICbpuIbXG",
                current_balance: 5000.00,
                create_at: new Date(),
                updated_at: new Date(),
            }
        ]
    });
    console.log("✅ Sample users added to database!");
    await prisma.categories.deleteMany({});
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
    ];
    const incomeCategories = [
        "Lương",
        "Thu nhập khác",
    ];
    const expenseCategoriesData = expenseCategories.map(name => ({
        name,
        type: enum_1.TransactionType.EXPENSE
    }));
    const incomeCategoriesData = incomeCategories.map(name => ({
        name,
        type: enum_1.TransactionType.INCOME
    }));
    await prisma.categories.createMany({
        data: [...expenseCategoriesData, ...incomeCategoriesData],
        skipDuplicates: true,
    });
    console.log("✅ Categories added to database!");
}
main()
    .catch(e => console.error(e))
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map