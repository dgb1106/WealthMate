import React from 'react';
import Head from 'next/head';
import AuthLayout from '@/layouts/AuthLayout/index';
import {RegisterForm} from '@/components/auth/RegisterForm';
import type { Metadata } from 'next';
import myImage from '@/assets/images/14.png';
import { TruckFilled } from '@ant-design/icons';

export const metadata: Metadata = {
  title: 'Đăng ký | WealthMate',
  description: 'Đăng ký tài khoản WealthMate',
};

const RegisterPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Create Account | WealthMate</title>
        <meta name="description" content="Tạo tài khoản mới" />
      </Head>
      <AuthLayout 
      title="Tạo tài khoản của bạn"
      isRegister={true}
    >
      <RegisterForm />
    </AuthLayout>
    </>
  );
};

export default RegisterPage;