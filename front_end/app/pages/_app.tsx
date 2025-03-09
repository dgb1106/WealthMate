import React from 'react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { AuthProvider } from '../contexts/AuthContext';
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Head>
        <title>WealthMate</title>
        <link rel="icon" href="/avaicon.png" />
      </Head>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;