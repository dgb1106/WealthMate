import React from 'react';
import AuthLayout from '@/layouts/AuthLayout/index';
import { LoginForm } from '@/components/auth/LoginForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In | WealthMate',
  description: 'Sign in to your WealthMate account',
};

<<<<<<< HEAD
=======
// Define the type for credentials
>>>>>>> 4265faa45cf72565b374b1d9019bc50bc0376657
interface LoginCredentials {
  email: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const handleLogin = async (credentials: LoginCredentials) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify(credentials),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
<<<<<<< HEAD
      localStorage.setItem('authToken', data.token);
=======
>>>>>>> 4265faa45cf72565b374b1d9019bc50bc0376657
    } else {
      // Show error message
    }
  };

  return (
    <AuthLayout title="Sign In to WealthMate">
      <LoginForm />
    </AuthLayout>
  );
};

export default LoginPage;