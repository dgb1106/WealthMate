'use client'

import React from 'react';
import { Button } from '../../UI/Button';
import { Input } from '../../UI/Input';
import { useAuth } from '../../../hooks/useAuth';
import type { RegisterFormData } from '../../../types/auth';
import styles from './styles.module.css';
import Link from 'next/link';

export const RegisterForm: React.FC = () => {
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: RegisterFormData = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
    };
    try {
      await register(data);
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.nameFields}>
        <Input
          type="text"
          name="firstName"
          placeholder="First Name"
          required
        />
        <Input
          type="text"
          name="lastName"
          placeholder="Last Name"
          required
        />
      </div>
      <Input
        type="email"
        name="email"
        placeholder="Email"
        required
      />
      <Input
        type="password"
        name="password"
        placeholder="Password"
        required
      />
      <Input
        type="password"
        name="confirmPassword"
        placeholder="Confirm Password"
        required
      />
      <Button type="submit">Create Account</Button>
      <div className="text-center mt-4">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/pages/auth/login" className="text-blue-600 hover:text-blue-500 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </form>
  );
}; 