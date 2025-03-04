import React, { ReactNode } from 'react';
import Image from 'next/image';
import styles from './styles.module.css';
import Link from 'next/link';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  imageSrc?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  imageSrc = '/png/13.png',
}) => {
  return (
    <div className={styles.container}>
      {/* Left side */}
      <div className={styles.leftSide}>
        <div className={styles.textCenter}>
          <h1 className={styles.title}>WealthMate</h1>
          <Image
            src={imageSrc}
            alt="WealthMate"
            width={600}
            height={600}
            className={styles.logo}
          />
          <p className={styles.subtitle}>Take control of your financial future</p>
        </div>
      </div>

      {/* Right side */}
      <div className={styles.rightSide}>
        <div className={styles.formContainer}>
          <div className={styles.formTitle}>
            <h2>{title}</h2>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};
export default AuthLayout;

