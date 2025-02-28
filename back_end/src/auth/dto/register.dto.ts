import { PreferredGoal, PreferredMood } from "src/common/enums/enum";


export class RegisterDto {
    email: string;
    password: string;
    name: string;
    phone: string;
    city: string;
    district: string;
    job: string;
    preferred_mood: PreferredMood;
    preferred_goal: PreferredGoal;
  }
  