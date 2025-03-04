'use client'

import React from 'react';
import Link from 'next/link';
import { Button } from '../../UI/Button';
import { Input } from '../../UI/Input';
import { useAuth } from '../../../hooks/useAuth';
import type { LoginFormData } from '../../../types/auth';

export const LoginForm: React.FC = () => {
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: LoginFormData = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    };
    try {
      await login(data);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          type="email"
          name="email"
          placeholder="Email"
          required
          className="w-full px-4 py-3 rounded-lg bg-[#EEF1FF] border-none focus:ring-2 focus:ring-blue-500"
        />
        <Input
          type="password"
          name="password"
          placeholder="Password"
          required
          className="w-full px-4 py-3 rounded-lg bg-[#EEF1FF] border-none focus:ring-2 focus:ring-blue-500"
        />
        <Button 
          type="submit"
          className="w-full py-3 bg-[#0F1B4C] hover:bg-blue-700 text-white font-medium rounded-lg"
        >
          Sign In
        </Button>
      </form>
      
      <p className="mt-6 text-center text-gray-600">
        Don't have an account?{' '}
        <Link href="/pages/auth/register" className="text-[#0F1B4C] font-medium hover:underline">
          Sign Up
        </Link>
      </p>
    </div>
  );
}; 