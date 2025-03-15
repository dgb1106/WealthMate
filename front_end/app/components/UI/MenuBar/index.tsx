import React from 'react';
import Link from 'next/link';
import styles from './styles.module.css';

const MenuBar: React.FC = () => {
  return (
    <nav className={styles.navContainer}>
      <div>
        <h3 id={styles.logo}> WealthMate</h3>
      </div>
      <ul className={styles.menuList}>
        <li>
          <Link href="/pages/dashboard" className={styles.menuItem}>
            <i className="fi fi-rr-apps"></i>
            <span>Dashboard</span>
          </Link>
        </li>
        <li>
          <Link href="/pages/transactions" className={styles.menuItem}>
            <i className="fi fi-rr-exchange"></i>
            <span>Transactions</span>
          </Link>
        </li>
        <li>
          <Link href="/pages/budgets" className={styles.menuItem}>
            <i className="fi fi-rr-piggy-bank-budget"></i>
            <span>Budgets</span>
          </Link>
        </li>
        <li>
          <Link href="/pages/investment" className={styles.menuItem}>
            <i className="fi fi-rr-plant-seed-invest"></i>
            <span>Investment</span>
          </Link>
        </li>
        <li>
          <Link href="/pages/analytics" className={styles.menuItem}>
            <i className="fi fi-rr-chart-histogram"></i>
            <span>Analytics</span>
          </Link>
        </li>
        <li>
          <Link href="/pages/ai_assistant" className={styles.menuItem}>
            <i className="fi fi-rr-message-bot"></i>
            <span>AI Assistant</span>
          </Link>
        </li>
        <li>
          <Link href="/pages/profile" className={styles.menuItem}>
            <i className="fi fi-rr-user"></i>
            <span>Profile</span>
          </Link>
        </li>
        <li>
          <Link href="/pages/auth/login" className={`${styles.menuItem} ${styles.logoutItem}`}>
            <span>Log out</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default MenuBar;