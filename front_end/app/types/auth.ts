export enum PreferredMood {
  IRRITATION = "IRRITATION",
  ENCOURAGEMENT = "ENCOURAGEMENT"
}

export enum PreferredGoal {
  SAVING = "SAVING",
  INVESTMENT = "INVESTMENT"
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  city?: string;
  district?: string;
  job?: string;
  preferred_mood?: PreferredMood;
  preferred_goal?: PreferredGoal;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
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

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export type AuthAction =
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'REGISTER_SUCCESS'; payload: User }
  | { type: 'REGISTER_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'AUTH_CHECKED' }; 