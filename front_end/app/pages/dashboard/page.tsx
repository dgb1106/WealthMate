'use client';

import React from 'react';
import MainLayout from '@/layouts/MainLayout/index';
import { useAuth } from '@/hooks/useAuth';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import { useRouter } from 'next/navigation';

const DashBoardPage: React.FC = () => {
  const { user } = useAuth();
  const { isAuthenticated, isLoading } = useAuthCheck();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated && !isLoading) {
    router.push('/pages/auth/login');
    return null;
  }
  
  return (
    <MainLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Welcome to your Dashboard</h1>
        {user && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <p className="font-medium">Logged in as: {user.email}</p>
            <p className="text-sm text-gray-600">User ID: {user.id}</p>
          </div>
        )}
        <div className="grid gap-4">
          <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2">Your Financial Summary</h2>
            <p>Dashboard content will appear here.</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default DashBoardPage;