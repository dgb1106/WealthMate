import React from 'react';
import Link from 'next/link';
import styles from './styles.module.css';

const MenuBar: React.FC = () => {
  return (
<<<<<<< HEAD
    <nav className={styles.navContainer}>
=======
    <nav className ={styles.navContainer}>
>>>>>>> 4265faa45cf72565b374b1d9019bc50bc0376657
      <div>
        <h3 id={styles.logo}> WealthMate</h3>
      </div>
      <ul className={styles.menuList}>
<<<<<<< HEAD
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
=======
        <li className={styles.menuItem}><i className="fi fi-rr-apps"></i><Link href="/pages/dashboard">Dashboard</Link></li>
        <li className={styles.menuItem}><i className="fi fi-rr-exchange"></i><Link href="/pages/transactions">Transactions</Link></li>
        <li className={styles.menuItem}><i className="fi fi-rr-piggy-bank-budget"></i><Link href="/pages/budgets">Budgets</Link></li>
        <li className={styles.menuItem}><i className="fi fi-rr-plant-seed-invest"></i><Link href="/pages/investment">Investment</Link></li>
        <li className={styles.menuItem}><i className="fi fi-rr-chart-histogram"></i><Link href="/pages/analytics">Analytics</Link></li>
        <li className={styles.menuItem}><i className="fi fi-rr-message-bot"></i><Link href="/pages/ai_assistant">AI Assistant</Link></li>
        <li className={`${styles.menuItem} ${styles.logoutItem}`}><Link href="/pages/auth/login">Log out</Link></li>
>>>>>>> 4265faa45cf72565b374b1d9019bc50bc0376657
      </ul>
    </nav>
  );
};

export default MenuBar;