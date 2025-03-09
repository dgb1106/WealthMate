'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../../UI/Button';
import { Input } from '../../UI/Input';
import { useAuth } from '../../../hooks/useAuth';
import type { RegisterFormData } from '../../../types/auth';
import { PreferredMood, PreferredGoal } from '../../../types/auth';
import styles from './styles.module.css';
import Link from 'next/link';

export const RegisterForm: React.FC = () => {
  const router = useRouter();
  const { register } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    const data: RegisterFormData = {
      email: formData.get('email') as string,
      password: password,
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      city: formData.get('city') as string,
      district: formData.get('district') as string,
      job: formData.get('job') as string,
      preferred_mood: formData.get('preferred_mood') as PreferredMood,
      preferred_goal: formData.get('preferred_goal') as PreferredGoal,
    };

    try {
      await register(data);
      router.push('/pages/auth/login');
    } catch (error: any) {
      setError(error.message || 'Registration failed. Please try again.');
      console.error('Registration failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <h3 className={styles.sectionTitle}>Personal Information</h3>

      {/* Full Name chiếm hết chiều rộng (2 cột) */}
      <div>
        <Input
          type="text"
          name="name"
          placeholder="Full Name"
          required
          className="w-full px-4 py-3 rounded-lg bg-[#EEF1FF] border-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Email và Phone chia làm 2 cột */}
      <div className={styles.fieldGroup}>
        <Input
          type="email"
          name="email"
          placeholder="Email"
          required
          className="w-full px-4 py-3 rounded-lg bg-[#EEF1FF] border-none focus:ring-2 focus:ring-blue-500"
        />
        <Input
          type="tel"
          name="phone"
          placeholder="Phone Number"
          required
          className="w-full px-4 py-3 rounded-lg bg-[#EEF1FF] border-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className={styles.formSection}>
        <h3 className={styles.sectionTitle}>Your Location</h3>
        <div className={styles.fieldGroup}>
          <Input
            type="text"
            name="city"
            placeholder="City"
            required
            className="w-full px-4 py-3 rounded-lg bg-[#EEF1FF] border-none focus:ring-2 focus:ring-blue-500"
          />
          <Input
            type="text"
            name="district"
            placeholder="District"
            required
            className="w-full px-4 py-3 rounded-lg bg-[#EEF1FF] border-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className={styles.formSection}>
        <h3 className={styles.sectionTitle}>Professional Information</h3>
        <Input
          type="text"
          name="job"
          placeholder="Job/Occupation"
          required
          className="w-full px-4 py-3 rounded-lg bg-[#EEF1FF] border-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className={styles.formSection}>
        <h3 className={styles.sectionTitle}>Preferences</h3>
        <div className={styles.fieldGroup}>
          <div className={styles.inlineField}>
            <label
              htmlFor="preferred_mood"
              className="text-sm font-medium text-gray-700 whitespace-nowrap"
            >
              Preferred Feedback Style
            </label>
            <select 
              id="preferred_mood" 
              name="preferred_mood" 
              className={styles.selectField}
              required
            >
              <option value="">Select feedback style</option>
              <option value={PreferredMood.ENCOURAGEMENT}>Encouraging</option>
              <option value={PreferredMood.IRRITATION}>Direct/Strict</option>
            </select>
          </div>
          <div className={styles.inlineField}>
            <label
              htmlFor="preferred_goal"
              className="text-sm font-medium text-gray-700 whitespace-nowrap"
            >
              Primary Financial Goal
            </label>
            <select 
              id="preferred_goal" 
              name="preferred_goal" 
              className={styles.selectField}
              required
            >
              <option value="">Select primary goal</option>
              <option value={PreferredGoal.SAVING}>Saving Money</option>
              <option value={PreferredGoal.INVESTMENT}>Growing Investments</option>
            </select>
          </div>
        </div>
      </div>

      <div className={styles.formSection}>
        <h3 className={styles.sectionTitle}>Security</h3>
        <div className={styles.fieldGroup}>
          <Input
            type="password"
            name="password"
            placeholder="Password"
            required
            className="w-full px-4 py-3 rounded-lg bg-[#EEF1FF] border-none focus:ring-2 focus:ring-blue-500"
          />
          <Input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            required
            className="w-full px-4 py-3 rounded-lg bg-[#EEF1FF] border-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <Button 
        type="submit"
        disabled={isLoading}
        className="w-full py-3 mt-3 bg-[#0F1B4C] hover:bg-blue-700 text-white font-medium rounded-lg"
      >
        {isLoading ? 'Creating Account...' : 'Create Account'}
      </Button>

      <div className="text-center mt-4">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/pages/auth/login" className="text-[#0F1B4C] hover:text-blue-700 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </form>
  );
};
