import React from 'react';
import { Card } from 'antd';
import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';
import styles from './styles.module.css';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface CategoryChartProps {
    categories: Array<{
        name: string;
        spent_amount: number;
    }>;
}

const CategoryChart: React.FC<CategoryChartProps> = ({ categories }) => {
    const options: ApexOptions = {
        chart: {
            type: 'donut',
        },
        labels: categories.length ? categories.map(cat => cat.name) : ["Không có dữ liệu"],
        plotOptions: {
            pie: {
                donut: {
                    size: '70%'
                }
            }
        },
        dataLabels: {
            enabled: true,
            formatter: function(val: number) {
                return val.toFixed(1) + "%"
            },
            style: {
                fontFamily: 'Prompt, sans-serif',
                fontWeight: 400
            },
        },
        legend: {
            position: 'bottom',
            fontSize: '14px',
            fontFamily: 'Prompt, sans-serif',
            fontWeight: 400,
        },
        tooltip: {
            y: {
                formatter: function(value) {
                    return value.toLocaleString() + ' VND'
                }
            }
        }
    };

    const series = categories.map(cat => cat.spent_amount);

    return (
        <Card className={styles.chartCard} title="Chi tiêu theo Danh mục">
            <ReactApexChart 
                options={options}
                series={series}
                type="donut"
                height={300}
            />
        </Card>
    );
};

export default CategoryChart;