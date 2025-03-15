import React from 'react';
import { Card, Button } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import dynamic from 'next/dynamic';
import styles from './styles.module.css';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface BudgetCardProps {
    budget: {
        id: string;
        name: string;
        limit_amount: number;
        spent_amount: number;
        category: {
            id: string;
            name: string;
        };
    };
    onEdit: (budget: any) => void;
}

const BudgetCard: React.FC<BudgetCardProps> = ({ budget, onEdit }) => {
    const { name, limit_amount, spent_amount, category } = budget;
    const remaining_amount = limit_amount - spent_amount;
    const percentage = (spent_amount / limit_amount) * 100;

    const options = {
        chart: {
            type: 'radialBar',
            offsetY: -10,
            sparkline: {
                enabled: true,
            }
        },
        plotOptions: {
            radialBar: {
                startAngle: -90,
                endAngle: 90,
                hollow: {
                    margin: 0,
                    size: '70%',
                    background: 'transparent',
                    image: undefined,
                },
                dataLabels: {
                    name: {
                        show: false,
                    },
                    value: {
                        show: false,
                    }
                }
            }
        },
        labels: ["Used"],
        colors: ["#003f88", "#e0e7ff"]
    };

    return (
        <Card className={styles.card}>
            <div className={styles.header}>
                <div>
                    <h3>{name}</h3>
                    <p>{category.name}</p>
                </div>
                <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => onEdit(budget)}
                    className={styles.editButton}
                />
            </div>
            <div className={styles.body}>
                <div className={styles.container}>
                    <ReactApexChart
                        options={options}
                        series={[Math.round(percentage)]}
                        type="radialBar"
                        height={150}
                    />
                </div>
                <div className={styles.amountContainer}>
                    <div>
                        <p>Left: </p>
                    </div>
                    <div>
                        <h3>{remaining_amount}</h3>
                    </div>
                </div>
            </div>
        </Card>
    )
};

export default BudgetCard;