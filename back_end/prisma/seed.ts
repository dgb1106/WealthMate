import { PreferredMood, PreferredGoal} from "src/common/enums/enum";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
        preferred_mood: PreferredMood.IRRITATION, // Enum
        preferred_goal: PreferredGoal.SAVING, // Enum
        hash_password: "$2b$10$KIXaC1OZKixG8hhZ/ICbpuIbXG", // Hash bcrypt của mật khẩu
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
        preferred_mood: PreferredMood.ENCOURAGEMENT,
        preferred_goal: PreferredGoal.SAVING, // Enum
        hash_password: "$2b$10$KIXaC1OZKixG8hhZ/ICbpuIbXG",
        current_balance: 5000.00,
        create_at: new Date(),
        updated_at: new Date(),
      }
    ]
  });

  console.log("✅ Sample users added to database!");
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
