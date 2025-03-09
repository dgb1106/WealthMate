import React from 'react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import '../styles/globals.css';
import dynamic from 'next/dynamic';

// Tải động App để tránh lỗi SSR với React Router
const App = dynamic(() => import('../App'), { ssr: false });

function MyApp({ Component, pageProps }: AppProps) {
  // Kiểm tra xem có đang ở môi trường client không
  const isClient = typeof window !== 'undefined';

  return (
    <AuthProvider>
      <Head>
        <title>WealthMate</title>
        <link rel="icon" href="/avaicon.png" />
        <link rel="icon" href="/avaicon.png?v=2" />
      </Head>
      
      {/* Render App.tsx khi ở client-side */}
      {isClient ? (
        <BrowserRouter>
          <App />
        </BrowserRouter>
      ) : (
        // Fallback cho SSR - có thể thêm loading state ở đây
        <div>Loading...</div>
      )}
    </AuthProvider>
  );
}

export default MyApp;