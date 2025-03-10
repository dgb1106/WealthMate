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

interface AuthCheckResponse {
  isAuthenticated: boolean;
  user?: {
    userId: string;
    email: string;
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
      
      // Authentication is successful
      return responseData as LoginResponse;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  register: async (data: RegisterFormData): Promise<{user: User, token: string, message: string}> => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          name: data.name,
          phone: data.phone,
          city: data.city,
          district: data.district,
          job: data.job,
          preferred_mood: data.preferred_mood,
          preferred_goal: data.preferred_goal
        }),
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
    try {
      const response = await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Logout failed');
      }
      
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  getCurrentUser: async (): Promise<User | null> => {
    try {
      console.log('Checking current user auth status');
      const response = await fetch(`${API_URL}/auth/check`, {
        method: 'GET',
        credentials: 'include',
      });
      
      console.log('Auth check response status:', response.status);
      
      let data: AuthCheckResponse;
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
      
      // Transform the backend user format to the frontend user format
      if (data.user) {
        return {
          id: data.user.userId,
          email: data.user.email,
        } as User;
      }
      
      return null;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return null;
    }
  },
};