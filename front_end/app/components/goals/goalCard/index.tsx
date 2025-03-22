import React from 'react';
import { Card, Button, Progress } from 'antd';
import { EditFilled } from '@ant-design/icons';
import styles from './styles.module.css';

interface GoalCardProps {
    goal: {
        id: string;
        name: string;
        target_amount: number;
        saved_amount: number;
        due_date: Date;
        created_at: Date;
    };
    onEdit: (goal: any) => void;
}

const GoalCard: React.FC<GoalCardProps> = ({ goal, onEdit }) => {
    const { target_amount, saved_amount, name, due_date } = goal;
    const displayTargetAmount = target_amount * 1000;
    const displaySavedAmount = saved_amount * 1000;
    const percentage = Math.min(Math.max((displaySavedAmount / displayTargetAmount) * 100, 0), 100);

    return (
        <Card className={styles.card}>
            <div className={styles.header}>
                <div>
                    <p>{name}</p>
                </div>
                <Button
                    type="text"
                    icon={<EditFilled />}
                    onClick={() => onEdit(goal)}
                    className={styles.editButton}
                />
            </div>
            <div className={styles.body}>
                <div className={styles.container}>
                    <div className={styles.progressContent}>
                        <Progress
                            type="line"
                            percent={Math.round(percentage)}
                            status={percentage >= 100 ? "success" : "active"}
                            strokeColor="#004aad"
                            strokeWidth={12}
                        />
                        <div className={styles.amounts}>
                            <span>
                                <span className={styles.savedAmount}>{displaySavedAmount.toLocaleString()}</span>
                                <span className={styles.separator}> / </span>
                                <span className={styles.targetAmount}>{displayTargetAmount.toLocaleString()} VND</span>
                            </span>
                        </div>
                        <div className={styles.dueDate}>
                            Hạn: {new Date(due_date).toLocaleDateString()}
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default GoalCard;