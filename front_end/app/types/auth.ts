export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData extends LoginFormData {
  firstName: string;
  lastName: string;
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