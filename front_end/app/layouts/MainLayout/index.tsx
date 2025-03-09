import React, { ReactNode } from 'react';
import styles from './styles.module.css';
import MenuBar from '@/components/UI/MenuBar';

interface MainLayoutProps {
  children: ReactNode;
  leftContent?: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, leftContent }) => {
  return (
    <div className={styles.container}>
      <div className={styles.leftContainer}>
        {leftContent || (
          <MenuBar />
        )}
      </div>
      <div className={styles.rightContainer}>
        {children}
      </div>
    </div>
  );
};

export default MainLayout;
