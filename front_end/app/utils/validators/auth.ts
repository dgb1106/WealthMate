import type { LoginFormData, RegisterFormData } from '@/app/types/auth';

export const validateLoginForm = (data: LoginFormData): string[] => {
  const errors: string[] = [];

  if (!data.email) {
    errors.push('Email is required');
  } else if (!/\S+@\S+\.\S+/.test(data.email)) {
    errors.push('Email is invalid');
  }

  if (!data.password) {
    errors.push('Password is required');
  } else if (data.password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  return errors;
};

export const validateRegisterForm = (data: RegisterFormData): string[] => {
  const errors: string[] = [];

  if (!data.firstName) {
    errors.push('First name is required');
  }

  if (!data.lastName) {
    errors.push('Last name is required');
  }

  const loginErrors = validateLoginForm(data);
  errors.push(...loginErrors);

  return errors;
}; 