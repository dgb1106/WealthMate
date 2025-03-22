'use client';

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import MainLayout from '@/layouts/MainLayout/index';
import { useAuth } from '@/hooks/useAuth';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import { useRouter } from 'next/navigation';

const UserInfo = React.memo(({ user }: { user: any }) => {
  return (
    <div className="mb-6 p-4 bg-blue-50 rounded-lg">
      <p className="font-medium">Logged in as: {user.email}</p>
      <p className="text-sm text-gray-600">User ID: {user.id}</p>
    </div>
  );
});

const FinancialSummary = React.memo(() => {
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-2">Your Financial Summary</h2>
      <p>Dashboard content will appear here.</p>
    </div>
  );
});

const DashboardFallback = () => (
  <MainLayout>
    <div className="p-6">
      {/* Skeleton UI giống với layout của dashboard */}
      <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-6"></div>
      <div className="h-24 w-full bg-gray-200 rounded animate-pulse mb-6"></div>
      <div className="grid gap-4">
        <div className="h-40 w-full bg-gray-200 rounded animate-pulse"></div>
      </div>
    </div>
  </MainLayout>
);

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardFallback />}>
      <DashboardContent />
    </Suspense>
  );
}

const DashboardContent = () => {
  const { user } = useAuth();
  const { isAuthenticated, isLoading } = useAuthCheck();
  const router = useRouter();
  
  useEffect(() => {
    console.log("Dashboard auth state:", { isAuthenticated, isLoading, user });
  }, [isAuthenticated, isLoading, user]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="p-6">
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-6"></div>
          <div className="h-24 w-full bg-gray-200 rounded animate-pulse mb-6"></div>
          <div className="grid gap-4">
            <div className="h-40 w-full bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6">
        <h1>Tổng Quan</h1>
        
        {user && <UserInfo user={user} />}
        
        <div className="grid gap-4">
          <FinancialSummary />
        </div>
      </div>
    </MainLayout>
  );
}