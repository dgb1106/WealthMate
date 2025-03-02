import React from 'react';
import Head from 'next/head';
import AuthLayout from '../../../components/layouts/AuthLayout';
import RegisterForm from '../../components/auth/RegisterForm';

const RegisterPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Create Account | WealthMate</title>
        <meta name="description" content="Create a new WealthMate account" />
      </Head>
      <AuthLayout title="Create Your Account">
        <RegisterForm />
      </AuthLayout>
    </>
  );
};

export default RegisterPage;