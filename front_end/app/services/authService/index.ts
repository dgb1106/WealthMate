import { API_URL } from '@/utils/constants';
import type { LoginFormData, RegisterFormData, User } from '@/types/auth';

interface LoginResponse {
  token: string;
  message: string;
  user?: {
    id: string;
    email: string;
    name?: string;
  };
}

export const authService = {
  login: async (data: LoginFormData): Promise<LoginResponse> => {
    console.log('Login request to:', `${API_URL}/auth/login`);
    console.log('Login data:', JSON.stringify(data));
    
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      
      console.log('Login response status:', response.status);
      
      // Capture the response data first
      let responseData;
      try {
        responseData = await response.json();
        console.log('Login response data:', responseData);
      } catch (err) {
        console.error('Error parsing JSON:', err);
        throw new Error('Server response error');
      }
      
      // Then check if the response was successful
      if (!response.ok) {
        const errorMessage = responseData?.message || `Error ${response.status}: Login failed`;
        console.error('Login failed:', errorMessage);
        throw new Error(errorMessage);
      }
      
      // Check if we have a token in the response
      if (!responseData.token) {
        console.error('No token in response:', responseData);
        throw new Error('Authentication failed: No token received');
      }
      
      return responseData as LoginResponse;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  register: async (data: RegisterFormData): Promise<User> => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.message || 'Registration failed');
      }
      
      return responseData;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  },

  getCurrentUser: async (): Promise<User | null> => {
    try {
      console.log('Checking current user auth status');
      const response = await fetch(`${API_URL}/auth/check`, {
        credentials: 'include',
      });
      
      console.log('Auth check response status:', response.status);
      
      let data;
      try {
        data = await response.json();
        console.log('Auth check response data:', data);
      } catch (err) {
        console.error('Error parsing JSON in auth check:', err);
        return null;
      }
      
      if (!response.ok || !data.isAuthenticated) {
        console.log('User not authenticated');
        return null;
      }
      
      console.log('User is authenticated:', data.user);
      return data.user;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return null;
    }
  },
};