'use client';

import React from 'react';
import MainLayout from '@/layouts/MainLayout';
import styles from './styles.module.css';

import UserGreetingCard from '@/components/dashboard/UserGreetingCard';
import TotalBalanceCard from '@/components/dashboard/TotalBalanceCard';
import IncomeExpenseCard from '@/components/dashboard/IncomeExpenseCard';
import PaymentScheduleCard from '@/components/dashboard/PaymentScheduleCard';
import MostSpentCategoriesCard from '@/components/dashboard/MostSpentCategoriesCard';

export default function DashboardPage() {
  return (
    <MainLayout>
      <div className={styles.parent}>
        <div className={styles.div1}><UserGreetingCard /></div>
        <div className={styles.div2}><TotalBalanceCard /></div>
        <div className={styles.div3}><IncomeExpenseCard /></div>
        <div className={styles.div4}><PaymentScheduleCard /></div>
        <div className={styles.div5}><MostSpentCategoriesCard /></div>
      </div>
    </MainLayout>
  );
}