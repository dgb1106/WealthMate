import React, { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title }) => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Brand/Logo */}
      <div className="hidden md:flex md:w-1/2 bg-blue-600 flex-col justify-center items-center p-8">
        <div className="text-center">
          <h1 className="text-white text-4xl font-bold mb-6">WealthMate</h1>
          <Image 
            src="/assets/logo.png" 
            alt="WealthMate" 
            width={200} 
            height={200}
            className="mx-auto" 
          />
          <p className="text-white text-xl mt-6">
            Take control of your financial future
          </p>
        </div>
      </div>
      
      {/* Right side - Auth Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">{title}</h2>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;