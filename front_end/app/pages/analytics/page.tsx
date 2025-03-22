"use client";
import React from "react";
import { Row, Col } from "antd";
import MainLayout from '@/layouts/MainLayout/index';
import ExpenseByCategoryChart from "@/components/analyst/ExpenseByCategoryChart";
import IncomeBySourceChart from "@/components/analyst/IncomeBySourceChart";
import IncomeExpenseComparisonChart from "@/components/analyst/ComparisonBarChart";
import AIAssistantButton from "@/components/analyst/AIAssistanButton";
import styles from "./styles.module.css";

const AnalystPage: React.FC = () => {
  return (
    <MainLayout>
      <div className={styles.container}>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <ExpenseByCategoryChart />
          </Col>
          <Col xs={24} md={8}>
            <IncomeBySourceChart />
          </Col>
        </Row>

        <Row gutter={[24, 24]} style={{ marginTop: "24px" }}>
          <Col xs={24}>
            <IncomeExpenseComparisonChart />
          </Col>
        </Row>

        <Row justify="end" style={{ marginTop: "24px" }}>
          <AIAssistantButton />
        </Row>
      </div>
    </MainLayout>
  );
};

export default AnalystPage;
