'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export const useAuthCheck = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          setIsAuthenticated(false);
          setIsLoading(false);
          localStorage.removeItem('authToken');
          return;
        }
        try {
          const tokenData = JSON.parse(atob(token.split('.')[1]));
          const expirationTime = tokenData.exp * 1000; 
          if (Date.now() >= expirationTime) {
            console.log('Token has expired');
            localStorage.removeItem('authToken');
            setIsAuthenticated(false);
            setIsLoading(false);
            return;
          }
        } catch (e) {
          console.error('Error parsing token:', e);
          localStorage.removeItem('authToken');
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/check`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Cache-Control': 'no-cache',
          }
        });

        if (response.ok) {
          const data = await response.json();
          setIsAuthenticated(data.isAuthenticated);
          if (!data.isAuthenticated) {
            localStorage.removeItem('authToken');
          }
        } else {
          console.error('Auth check failed:', response.status, response.statusText);
          localStorage.removeItem('authToken');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        localStorage.removeItem('authToken');
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  return { isAuthenticated, isLoading };
};