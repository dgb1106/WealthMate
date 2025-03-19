import React from 'react';
import { Card, Button } from 'antd';
import { EditFilled } from '@ant-design/icons';
import dynamic from 'next/dynamic';
import styles from './styles.module.css';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface BudgetCardProps {
    budget: {
        id: string;
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
    const { limit_amount, spent_amount, category } = budget;
    const displayLimitAmount = limit_amount * 1000;
    const displaySpentAmount = spent_amount * 1000;
    const remaining_amount: number = displayLimitAmount - displaySpentAmount;
    const percentage = Math.min(Math.max((remaining_amount / displayLimitAmount) * 100, 0), 100);

    const options = {
        chart: {
            type: 'radialBar' as 'radialBar',
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
                    size: '55%',
                    background: 'transparent',
                },
                dataLabels: {
                    name: { 
                        /*show: true,
                        fontSize: '16px',
                        fontFamily: 'Lufga, sans-serif',
                        fontWeight: 600,
                        color: "#a6a6a6",
                        offsetY: -35, */
                        show: false
                    },
                    value: {
                        /*show: true,
                        fontSize: '18px',
                        fontWeight: 700,
                        fontFamily: 'Lufga, sans-serif',
                        color: "#000000",
                        offsetY: 10, 
                        formatter: function() {
                            return `${limit_amount.toLocaleString()} VND`;
                        }*/
                        show: false,
                        formatter: function() {
                            return `${displayLimitAmount.toLocaleString()} VND`;
                        }
                    }
                }
            }
        },
        fill: {
            colors: [remaining_amount >= 0 ? "#004aad" : "#ff4d4f"],
            type: "solid",
        },
        stroke: { lineCap: "round" as "round"},
        labels: ['Left: '],
        tooltip: {
            enabled: false
        }
    };    

    return (
        <Card className={styles.card}>
            <div className={styles.header}>
                <div>
                    <p>{category.name}</p>
                </div>
                <Button
                    type="text"
                    icon={<EditFilled />}
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
                        height={260}
                    />
                    <div className={styles.chartOverlay}>
                        <span className={styles.label}>Left:</span>
                        <span className={styles.value}>{remaining_amount.toLocaleString()} VND</span>
                    </div>
                </div>
            </div>
        </Card>
    )
};

export default BudgetCard;