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
        } else {
          console.error('Auth check failed:', response.status, response.statusText);
          localStorage.removeItem('authToken');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  return { isAuthenticated, isLoading };
};