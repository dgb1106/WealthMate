import React, { ReactNode } from 'react';
import styles from './styles.module.css';

interface MainLayoutProps {
  children: ReactNode;
  leftContent?: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, leftContent }) => {
  return (
    <div className={styles.container}>
      <div className={styles.leftContainer}>
        {leftContent || (
          <div>
            <h3>Navigation</h3>
            <div className={styles.menuItem}>Menu</div>
            <div className={styles.menuItem}>Profile</div>
            <div className={`${styles.menuItem} ${styles.logoutItem}`}>Log out</div>
          </div>
        )}
      </div>
      <div className={styles.rightContainer}>
        {children}
      </div>
    </div>
  );
};

export default MainLayout;
