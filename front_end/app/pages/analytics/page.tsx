"use client";
import React from "react";
import { Row, Col, Flex } from "antd";
import MainLayout from '@/layouts/MainLayout/index';
import MostSpentCategoriesChart from "@/components/analyst/MostSpentCategoriesChart";
import BudgetOverviewChart from "@/components/analyst/BudgetOverviewChart";
import IncomeExpenseComparisonChart from "@/components/analyst/ComparisonBarChart";
import BudgetSummaryPieChart from "@/components/analyst/BudgetSummaryPieChart";
import CashFlowTrendChart from "@/components/analyst/MoneyFlowTrend";
import TrendAnalysisChart from "@/components/analyst/TrendAnalysisChart";
import AIAssistantButton from "@/components/analyst/AIAssistanButton";
import styles from "./styles.module.css";

const AnalystPage: React.FC = () => {
  return (
    <MainLayout>
      <div className={styles.container}>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <MostSpentCategoriesChart />
          </Col>
          <Col xs={24} md={8}>
            <BudgetSummaryPieChart />
          </Col>
          <Col xs={24} md={8}>
            <Flex justify="center" align="center" style={{ height: "100%" }}>
              <AIAssistantButton />
            </Flex>
          </Col>
        </Row>

        <Row gutter={[24, 24]} style={{ marginTop: "24px" }}>
          <Col xs={24}>
            <BudgetOverviewChart />
          </Col>
        </Row>

        <Row gutter={[24, 24]} style={{ marginTop: "24px" }}>
          <Col xs={24}>
            <CashFlowTrendChart />
          </Col>
        </Row>

        <Row gutter={[24, 24]} style={{ marginTop: "24px" }}>
          <Col xs={24}>
            <TrendAnalysisChart />
          </Col>
        </Row>

        <Row gutter={[24, 24]} style={{ marginTop: "24px" }}>
          <Col xs={24}>
            <IncomeExpenseComparisonChart />
          </Col>
        </Row>
      </div>
    </MainLayout>
  );
};

export default AnalystPage;