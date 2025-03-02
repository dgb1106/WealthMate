import React from 'react';
import Head from 'next/head';
import AuthLayout from '../../components/layouts/AuthLayout';
import LoginForm from '../../components/auth/LoginForm';

const LoginPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Sign In | WealthMate</title>
        <meta name="description" content="Sign in to your WealthMate account" />
      </Head>
      <AuthLayout title="Sign In to WealthMate">
        <LoginForm />
      </AuthLayout>
    </>
  );
};

export default LoginPage;