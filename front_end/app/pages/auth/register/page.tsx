import React from 'react';
import Head from 'next/head';
import AuthLayout from '@/layouts/AuthLayout/index';
import {RegisterForm} from '@/components/auth/RegisterForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up | WealthMate',
  description: 'Sign Up to your WealthMate',
};

const RegisterPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Create Account | WealthMate</title>
        <meta name="description" content="Create a new WealthMate account" />
      </Head>
      <AuthLayout 
      title="Create Your Account"
      imageSrc="/png/14.png"
    >
      <RegisterForm />
    </AuthLayout>
    </>
  );
};

export default RegisterPage;