import type { LoginFormData, RegisterFormData } from '@/types/auth';

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

  if (!data.name) {
    errors.push('Full name is required');
  }

  if (!data.phone) {
    errors.push('Phone number is required');
  }

  if (!data.city) {
    errors.push('City is required');
  }

  if (!data.district) {
    errors.push('District is required');
  }

  if (!data.job) {
    errors.push('Job is required');
  }

  // Check login-related fields (email, password)
  const loginData: LoginFormData = {
    email: data.email,
    password: data.password
  };
  
  const loginErrors = validateLoginForm(loginData);
  errors.push(...loginErrors);

  return errors;
};