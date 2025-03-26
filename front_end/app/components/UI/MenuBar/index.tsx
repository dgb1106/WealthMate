import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './styles.module.css';

const MenuBar: React.FC = () => {
  return (
    <nav className={styles.navContainer}>
      <div className={styles.logoContainer}>
        <Image className={styles.logoImage} src="/logo.png" alt="WealthMate Logo" width={45} height={45} />
        <Image className={styles.logoName} src="/logo-name.png" alt="WealthMate" width={120} height={60} />
      </div>
      <ul className={styles.menuList}>
        <li>
          <Link href="/pages/dashboard" className={styles.menuItem}>
            <i className="fi fi-rr-apps"></i>
            <span>Tổng Quan</span>
          </Link>
        </li>
        <li>
          <Link href="/pages/transactions" className={styles.menuItem}>
            <i className="fi fi-rr-exchange"></i>
            <span>Giao Dịch</span>
          </Link>
        </li>
        <li>
          <Link href="/pages/goals" className={styles.menuItem}>
            <i className="fi fi-rr-bullseye-arrow"></i>
            <span>Mục Tiêu</span>
          </Link>
        </li>
        <li>
          <Link href="/pages/budgets" className={styles.menuItem}>
            <i className="fi fi-rr-piggy-bank-budget"></i>
            <span>Ngân Sách</span>
          </Link>
        </li>
        <li>
          <Link href="/pages/investment" className={styles.menuItem}>
            <i className="fi fi-rr-plant-seed-invest"></i>
            <span>Đầu Tư</span>
          </Link>
        </li>
        <li>
          <Link href="/pages/analytics" className={styles.menuItem}>
            <i className="fi fi-rr-chart-histogram"></i>
            <span>Thống Kê</span>
          </Link>
        </li>
        <li>
          <Link href="/pages/loans" className={styles.menuItem}>
            <i className="fi fi-rr-handshake-deal-loan"></i>
            <span>Khoản Nợ</span>
          </Link>
        </li>
        <li>
          <Link href="/pages/family" className={styles.menuItem}>
            <i className="fi fi-rr-people-roof"></i>
            <span>Gia Đình</span>
          </Link>
        </li>
        <li>
          <Link href="/pages/ai_assistant" className={styles.menuItem}>
            <i className="fi fi-rr-message-bot"></i>
            <span>Trợ Lý Ảo</span>
          </Link>
        </li>
        <li>
          <Link href="/pages/profile" className={styles.menuItem}>
            <i className="fi fi-rr-user"></i>
            <span>Cá Nhân</span>
          </Link>
        </li>
        <li>
          <Link href="/pages/auth/login" className={`${styles.menuItem} ${styles.logoutItem}`}>
            <span>Đăng Xuất</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default MenuBar;