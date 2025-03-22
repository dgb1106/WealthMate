'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '../../UI/Button';
import { Input } from '../../UI/Input';
import styles from './styles.module.css';

interface LoginCredentials {
  email: string;
  password: string;
}

export const LoginForm: React.FC = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
  
    const formData = new FormData(e.currentTarget);
    const credentials: LoginCredentials = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    };
  
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        credentials: 'include' 
      });
  
      const data = await response.json();
        
      if (response.ok) {
        if (data.token) {
          localStorage.setItem('authToken', data.token);
        }
        router.push('/pages/dashboard');
      } else {
        setError(data.message || 'Sai email hoặc mật khẩu');
      }
    } catch (error) {
      setError('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form || ''}>
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="mb-4">
        <Input
          type="email"
          name="email"
          placeholder="Email"
          required
          className="w-full px-4 py-3 rounded-lg bg-[#EEF1FF] border-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="mb-6">
        <Input
          type="password"
          name="password"
          placeholder="Password"
          required
          className="w-full px-4 py-3 rounded-lg bg-[#EEF1FF] border-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <Button 
        type="submit"
        disabled={isLoading}
        className="w-full py-3 bg-[#0F1B4C] hover:bg-blue-700 text-white font-medium rounded-lg"
      >
        {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
      </Button>

      <div className="text-center mt-4">
        <p className="text-sm text-gray-600">
          Chưa có tài khoản?{' '}
          <Link href="/pages/auth/register" className="text-[#0F1B4C] hover:text-blue-700 font-medium">
            Tạo tài khoản
          </Link>
        </p>
      </div>
    </form>
  );
}; 