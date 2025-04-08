import React, { ReactNode } from 'react';
import Image from 'next/image';
import styles from './styles.module.css';
import Link from 'next/link';
import loginImage from '@/assets/images/13.png';
import registerImage from '@/assets/images/14.png';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  isRegister?: boolean;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  isRegister = false,
}) => {
  const imageToShow = isRegister ? registerImage : loginImage;
  
  return (
    <div className={styles.container}>
      {/* Left side */}
      <div className={styles.leftSide}>
        <div className={styles.textCenter}>
          <h1 className={styles.title}>WealthMate</h1>
          <Image
            src={imageToShow}
            alt="WealthMate"
            width={1600}
            height={1600}
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

