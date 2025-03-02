import { User } from '../types/user';

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface LoginResponse {
  user: User;
  token: string;
}

// Base API URL - should be stored in .env file for different environments
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const authService = {
  // Register a new user
  async register(userData: RegisterData): Promise<User> {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const data: LoginResponse = await response.json();
      
      // Store the token in localStorage
      localStorage.setItem('token', data.token);
      
      return data.user;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },

  // Login a user
  async login(email: string, password: string): Promise<User> {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data: LoginResponse = await response.json();
      
      // Store the token in localStorage
      localStorage.setItem('token', data.token);
      
      return data.user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Get the currently logged in user
  async getCurrentUser(): Promise<User | null> {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return null;
      }
      
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get current user');
      }

      const user: User = await response.json();
      return user;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },

  // Logout the user
  async logout(): Promise<void> {
    localStorage.removeItem('token');
  },
};