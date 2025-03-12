import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/auth/login/page';
import RegisterPage from './pages/auth/register/page';
import DashboardPage from './pages/dashboard/page';
import TransactionsPage from './pages/transactions/page';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/pages/auth/login" />;
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
