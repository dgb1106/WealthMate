'use client';

<<<<<<< HEAD
import React, { useEffect, useState, useMemo, Suspense } from 'react';
=======
import React, { useEffect, useState } from 'react';
>>>>>>> 4265faa45cf72565b374b1d9019bc50bc0376657
import MainLayout from '@/layouts/MainLayout/index';
import { useAuth } from '@/hooks/useAuth';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import { useRouter } from 'next/navigation';

<<<<<<< HEAD
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
=======
const DashBoardPage: React.FC = () => {
  const { user } = useAuth();
  const { isAuthenticated, isLoading } = useAuthCheck();
  const router = useRouter();
  const [debugInfo, setDebugInfo] = useState<string>('');
  
  useEffect(() => {
    console.log("Dashboard auth state:", { isAuthenticated, isLoading, user });
    setDebugInfo(`Auth: ${isAuthenticated ? 'Yes' : 'No'}, Loading: ${isLoading ? 'Yes' : 'No'}`);
>>>>>>> 4265faa45cf72565b374b1d9019bc50bc0376657
  }, [isAuthenticated, isLoading, user]);

  if (isLoading) {
    return (
<<<<<<< HEAD
      <MainLayout>
        <div className="p-6">
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-6"></div>
          <div className="h-24 w-full bg-gray-200 rounded animate-pulse mb-6"></div>
          <div className="grid gap-4">
            <div className="h-40 w-full bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </MainLayout>
=======
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="mb-4">Loading authentication status...</p>
        <div className="p-3 bg-yellow-100 text-yellow-800 rounded">
          <p>Debug info: Auth: {isAuthenticated === null ? 'Checking' : (isAuthenticated ? 'Yes' : 'No')}</p>
        </div>
      </div>
>>>>>>> 4265faa45cf72565b374b1d9019bc50bc0376657
    );
  }

  return (
    <MainLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Welcome to your Dashboard</h1>
<<<<<<< HEAD
        
        {user && <UserInfo user={user} />}
        
        <div className="grid gap-4">
          <FinancialSummary />
=======
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
>>>>>>> 4265faa45cf72565b374b1d9019bc50bc0376657
        </div>
      </div>
    </MainLayout>
  );
<<<<<<< HEAD
}
=======
};

export default DashBoardPage;
>>>>>>> 4265faa45cf72565b374b1d9019bc50bc0376657
