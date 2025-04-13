import React from 'react';
import { Card, Button } from 'antd';
import { EditFilled, CalendarFilled } from '@ant-design/icons';
import dynamic from 'next/dynamic';
import dayjs from 'dayjs';
import styles from './styles.module.css';

interface LoanCardProps {
    loan: {
        id: number;
        name: string;
        due_date: Date;
        total_amount: number;
        remaining_amount: number;
        interest_rate: number;
        monthly_payment: number;
    };
    onEdit: (loan: any) => void;
    onRepaymentPlan: (loan: any) => void;
}

const LoanCard: React.FC<LoanCardProps> = ({ loan, onEdit, onRepaymentPlan }) => {
    const { total_amount, remaining_amount, name, interest_rate } = loan;
    const displayTotalAmount = total_amount * 1000;
    const daysLeft = dayjs(loan.due_date).diff(dayjs(), 'day');
    const percentage = Math.min(Math.max((remaining_amount / displayTotalAmount) * 100, 0), 100);

    return (
        <Card className={styles.card}>
            <div className={styles.header}>
                <div>
                    <p>{name}</p>
                </div>
                <div className={styles.headerButtons}>
                    <Button
                        type="text"
                        icon={<EditFilled />}
                        onClick={() => onEdit(loan)}
                        className={styles.editButton}
                    />
                    <Button
                        type="text"
                        icon={<CalendarFilled />}
                        onClick={() => onRepaymentPlan(loan)}
                        className={styles.editButton}
                    />
                </div>
            </div>
            <div className={styles.customBody}>
                <div className={styles.section}>
                    <span className={styles.label}>Đếm ngược</span>
                    <span className={styles.value}>D-{daysLeft}</span>
                </div>
                <div className={styles.section}>
                    <span className={styles.label}>Còn</span>
                    <span className={styles.value}>{percentage}%</span>
                </div>
            </div>
        </Card>
    )
};

export default LoanCard;