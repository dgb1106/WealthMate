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
    console.log('Login request to:', `${process.env.NEXT_PUBLIC_API_URL}/auth/login`);
    console.log('Login data:', JSON.stringify(data));
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
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
      
      // Store token in localStorage if it exists in the response
      if (responseData.token) {
        localStorage.setItem('authToken', responseData.token);
        console.log('Stored auth token in localStorage');
      } else {
        console.error('No token received in login response');
      }
      
      // Authentication is successful
      return responseData as LoginResponse;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  register: async (data: RegisterFormData): Promise<any> => {
    try {
      console.log('Register request to:', `${process.env.NEXT_PUBLIC_API_URL}/auth/register`);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      
      console.log('Registration response status:', response.status);
      
      // Capture response data
      let responseData;
      try {
        responseData = await response.json();
        console.log('Registration response data:', responseData);
      } catch (err) {
        console.error('Error parsing JSON:', err);
        throw new Error('Server response error');
      }
      
      if (!response.ok) {
        const errorMessage = responseData?.message || `Error ${response.status}: Registration failed`;
        console.error('Registration failed:', errorMessage);
        throw new Error(errorMessage);
      }
      
      // Store token in localStorage if it exists in the response
      if (responseData.token) {
        localStorage.setItem('authToken', responseData.token);
        console.log('Stored auth token in localStorage after registration');
      } else {
        console.error('No token received in registration response');
      }
      
      return responseData;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    try {
      console.log('Logging out');
      
      // Get token from localStorage
      const token = localStorage.getItem('authToken');
      
      // Always remove from localStorage regardless of API call result
      localStorage.removeItem('authToken');
      console.log('Removed auth token from localStorage');
      
      if (!token) {
        console.log('No token found, skipping API logout call');
        return;
      }
      
      // Call logout API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Logout failed');
      }
      
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API call fails, we have already removed the token
      // from localStorage, so the user is effectively logged out client-side
    }
  },

  getCurrentUser: async (): Promise<User | null> => {
    try {
      console.log('Checking current user auth status');
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        console.log('No auth token found in localStorage');
        return null;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/check`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache',
        }
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
        localStorage.removeItem('authToken'); // Clear invalid token
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
      localStorage.removeItem('authToken'); // Clear token on error
      return null;
    }
  },
};