<<<<<<< HEAD
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
=======
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
>>>>>>> 4265faa45cf72565b374b1d9019bc50bc0376657
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/auth/login/page';
import RegisterPage from './pages/auth/register/page';
import DashboardPage from './pages/dashboard/page';
<<<<<<< HEAD
import TransactionsPage from './pages/transactions/page';
=======
>>>>>>> 4265faa45cf72565b374b1d9019bc50bc0376657

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
<<<<<<< HEAD

        {/* Protected Routes - All will be wrapped with ProtectedRoute */}
=======
        
        {/* Protected Routes */}
>>>>>>> 4265faa45cf72565b374b1d9019bc50bc0376657
        <Route 
          path="/pages/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
<<<<<<< HEAD

        <Route
          path="/pages/transactions"
          element={
            <ProtectedRoute>
              <TransactionsPage />
            </ProtectedRoute>
          }
        />

        {/* Root path redirect */}
=======
        
        {/* Redirect to Dashboard or Login based on auth state */}
>>>>>>> 4265faa45cf72565b374b1d9019bc50bc0376657
        <Route 
          path="/" 
          element={
            isAuthenticated ? 
            <Navigate to="/pages/dashboard" /> : 
            <Navigate to="/pages/auth/login" />
          } 
        />
<<<<<<< HEAD

        {/* Catch all unauthorized routes and redirect to login */}
        <Route path="*" element={<Navigate to="/pages/auth/login" />} />
=======
        
        {/* Catch all other routes */}
        <Route path="*" element={<Navigate to="/" />} />
>>>>>>> 4265faa45cf72565b374b1d9019bc50bc0376657
      </Routes>
    </Router>
  );
};

<<<<<<< HEAD
export default App;
=======
export default App; 
>>>>>>> 4265faa45cf72565b374b1d9019bc50bc0376657
