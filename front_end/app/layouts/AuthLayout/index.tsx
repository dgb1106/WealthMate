import React, { ReactNode } from 'react';
import Image from 'next/image';
import styles from './styles.module.css';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  imageSrc?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ 
  children, 
  title,
  imageSrc = "/assets/logo.png"
}) => {
  return (
    <div className={styles.container}>
      {/* Left side - Brand/Logo */}
      <div className={styles.leftSide}>
        <div className={styles.brandContent}>
          <h1 className={styles.title}>WealthMate</h1>
          <Image 
            src={imageSrc} 
            alt="WealthMate" 
            width={200} 
            height={200}
            className={styles.logo}
          />
          <p className={styles.subtitle}>
            Take control of your financial future
          </p>
        </div>
      </div>
      
      {/* Right side - Auth Form */}
      <div className={styles.rightSide}>
        <div className={styles.formContainer}>
          <h2 className={styles.formTitle}>{title}</h2>
          {children}
        </div>
      </div>
    </div>
  );
};