import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/auth/login/page';
import RegisterPage from './pages/auth/register/page';
import DashboardPage from './pages/dashboard/page';
import TransactionsPage from './pages/transactions/page';
import AiAssistantPage from './pages/ai_assistant/page';
import ProfilePage from './pages/profile/page';
import BudgetsPage from './pages/budgets/page';
import ReportsPage from './pages/analytics/page';
import GoalsPage from './pages/goals/page';
import FamilyPage from './pages/family/page';
import LoansPage from './pages/loans/page';
import InvestmentPage from './pages/investment/page';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const hasToken = Boolean(localStorage.getItem('authToken'));
  if (!hasToken) {
    console.log('No auth token found, redirecting to login');
    return <Navigate to="/pages/auth/login" replace />;
  }
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log('User not authenticated, redirecting to login');
      navigate('/pages/auth/login', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/pages/auth/login" replace />;
  }
  
  return <>{children}</>;
};

const App: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/pages/auth/login" 
          element={isAuthenticated ? <Navigate to="/pages/dashboard" /> : <LoginPage />} 
        />
        <Route 
          path="/pages/auth/register" 
          element={isAuthenticated ? <Navigate to="/pages/dashboard" /> : <RegisterPage />} 
        />

        {/* Protected Routes - All will be wrapped with ProtectedRoute */}
        <Route 
          path="/pages/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />

        <Route
          path="/pages/transactions"
          element={
            <ProtectedRoute>
              <TransactionsPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/pages/ai_assistant"
          element={
            <ProtectedRoute>
              <AiAssistantPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/pages/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/pages/budgets"
          element={
            <ProtectedRoute>
              <BudgetsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/pages/reports"
          element={
            <ProtectedRoute>
              <ReportsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/pages/goals"
          element={
            <ProtectedRoute>
              <GoalsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/pages/family"
          element={
            <ProtectedRoute>
              <FamilyPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/pages/loans"
          element={
            <ProtectedRoute>
              <LoansPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/pages/investment"
          element={
            <ProtectedRoute>
              <InvestmentPage />
            </ProtectedRoute>
          }
        />

        {/* Root path redirect */}
        <Route 
          path="/" 
          element={
            isAuthenticated ? 
            <Navigate to="/pages/dashboard" /> : 
            <Navigate to="/pages/auth/login" />
          } 
        />

        {/* Catch all unauthorized routes and redirect to login */}
        <Route path="*" element={<Navigate to="/pages/auth/login" />} />
      </Routes>
    </Router>
  );
};

export default App;