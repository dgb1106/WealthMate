import React from 'react';
import AuthLayout from '@/layouts/AuthLayout';
import { LoginForm } from '@/components/auth/LoginForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In | WealthMate',
  description: 'Sign in to your WealthMate account',
};

const LoginPage: React.FC = () => {
  return (
    <AuthLayout title="Sign In to WealthMate">
      <LoginForm />
    </AuthLayout>
  );
};

export default LoginPage;