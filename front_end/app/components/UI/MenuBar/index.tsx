import React from 'react';
import Link from 'next/link';
import styles from './MenuBar.module.css';

const MenuBar: React.FC = () => {
  return (
    <nav className ={styles.nav}>
        <div id={styles.logo}>WealthMate</div>
        <ul> 
            <li>
                <Link href="/dashboard">
                    <a className={styles.link}>Dashboard</a>
                </Link>
            </li>
            <li>
                <Link href="/transactions">
                    <a className={styles.link}>Transactions</a>
                </Link>
            </li>
            <li>
                <Link href="/budgets">
                    <a className={styles.link}>Budgets</a>
                </Link>
            </li>
            <li>
                <Link href="/investments">
                    <a className={styles.link}>Investments</a>
                </Link>
            </li>
            <li>
                <Link href="/analytics">
                    <a className={styles.link}>Analytics</a>
                </Link>
            </li>
            <li>
                <Link href="/aiassistant">
                    <a className={styles.link}>AI Assistant</a>
                </Link>
            </li>
        </ul>
    </nav>
  );
};

export default MenuBar;