import React from 'react';
import AuthLayout from '@/layouts/AuthLayout/index';
import { LoginForm } from '@/components/auth/LoginForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Đăng Nhập | WealthMate',
  description: 'Đăng nhập vào tài khoản WealthMate của bạn',
};

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
      localStorage.setItem('authToken', data.token);
    } else {
      // Show error message
    }
  };

  return (
    <AuthLayout title="Đăng nhập WealthMate" isRegister={false}>
      <LoginForm />
    </AuthLayout>
  );
};

export default LoginPage;