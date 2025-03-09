import React from 'react';
import Link from 'next/link';
import styles from './styles.module.css';

const MenuBar: React.FC = () => {
  return (
    <nav className ={styles.navContainer}>
      <div>
        <h3 id={styles.logo}> WealthMate</h3>
      </div>
      <ul className={styles.menuList}>
        <li className={styles.menuItem}><i className="fi fi-rr-apps"></i><Link href="/dashboard">Dashboard</Link></li>
        <li className={styles.menuItem}><i className="fi fi-rr-exchange"></i><Link href="/pages/transactions">Transactions</Link></li>
        <li className={styles.menuItem}><i className="fi fi-rr-piggy-bank-budget"></i><Link href="/pages/budgets">Budgets</Link></li>
        <li className={styles.menuItem}><i className="fi fi-rr-plant-seed-invest"></i><Link href="/pages/investment">Investment</Link></li>
        <li className={styles.menuItem}><i className="fi fi-rr-chart-histogram"></i><Link href="/pages/analytics">Analytics</Link></li>
        <li className={styles.menuItem}><i className="fi fi-rr-message-bot"></i><Link href="/pages/ai_assistant">AI Assistant</Link></li>
        <li className={`${styles.menuItem} ${styles.logoutItem}`}><Link href="/pages/auth/login">Log out</Link></li>
      </ul>
    </nav>
  );
};

export default MenuBar;