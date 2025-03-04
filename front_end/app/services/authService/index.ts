import { API_URL } from '@/utils/constants';
import type { LoginFormData, RegisterFormData, User } from '@/types/auth';

export const authService = {
  login: async (data: LoginFormData): Promise<User> => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Login failed');
    }
    return response.json();
  },

  register: async (data: RegisterFormData): Promise<User> => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Registration failed');
    }
    return response.json();
  },

  logout: async (): Promise<void> => {
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
    });
  },

  getCurrentUser: async (): Promise<User | null> => {
    try {
      const response = await fetch(`${API_URL}/auth/me`);
      if (!response.ok) {
        return null;
      }
      return response.json();
    } catch {
      return null;
    }
  },
};