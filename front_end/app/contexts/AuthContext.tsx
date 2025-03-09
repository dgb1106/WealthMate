import React, { createContext, useReducer, useEffect, ReactNode } from 'react';
import { authService } from '../services/authService';
import type { User, AuthState, LoginFormData, RegisterFormData } from '../types/auth';

export interface AuthContextType extends AuthState {
  login: (data: LoginFormData) => Promise<User>;
  register: (data: RegisterFormData) => Promise<void>;
  logout: () => void;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

type AuthAction =
  | { type: 'LOGIN_REQUEST' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'REGISTER_REQUEST' }
  | { type: 'REGISTER_SUCCESS'; payload: User }
  | { type: 'REGISTER_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'AUTH_CHECKED' };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_REQUEST':
    case 'REGISTER_REQUEST':
      return {
        ...state,
        isLoading: true,
        error: null
      };
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
    case 'REGISTER_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'AUTH_CHECKED':
      return {
        ...state,
        isLoading: false,
      };
    default:
      return state;
  }
};

export const AuthContext = createContext<AuthContextType>({
  ...initialState,
  login: async () => { return {} as User },
  register: async () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (user) {
          dispatch({ type: 'LOGIN_SUCCESS', payload: user });
        }
      } catch (error) {
        console.error('Auth check failed', error);
      } finally {
        dispatch({ type: 'AUTH_CHECKED' });
      }
    };

    checkAuth();
  }, []);

  const login = async (data: LoginFormData) => {
    try {
      dispatch({ type: 'LOGIN_REQUEST' });
      
      if (!data.email || !data.password) {
        dispatch({ 
          type: 'LOGIN_FAILURE', 
          payload: 'Email and password are required' 
        });
        throw new Error('Email and password are required');
      }
      
      console.log('Logging in with:', data.email);
      
      // Get login response with token
      const response = await authService.login(data);
      console.log('Login successful, response:', response);
      
      // After successful login, get the current user info
      const user = await authService.getCurrentUser();
      
      if (!user) {
        throw new Error('Failed to get user after login');
      }
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      return user;
    } catch (error: any) {
      console.error('Login error in context:', error);
      dispatch({ 
        type: 'LOGIN_FAILURE', 
        payload: error.message || 'Login failed. Please try again.' 
      });
      throw error;
    }
  };

  const register = async (data: RegisterFormData) => {
    try {
      dispatch({ type: 'REGISTER_REQUEST' });
      
      // Call register API
      const result = await authService.register(data);
      console.log('Registration successful:', result);
      
      // Get user data after registration
      const user = await authService.getCurrentUser();
      
      if (!user) {
        throw new Error('Failed to get user after registration');
      }
      
      dispatch({ type: 'REGISTER_SUCCESS', payload: user });
    } catch (error: any) {
      console.error('Registration error in context:', error);
      dispatch({ 
        type: 'REGISTER_FAILURE', 
        payload: error.message || 'Registration failed. Please try again.' 
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Logout failed', error);
      // Still dispatch LOGOUT even if API call fails to ensure UI is updated
      dispatch({ type: 'LOGOUT' });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};