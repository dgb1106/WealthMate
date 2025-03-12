import DashBoardPage from "@/pages/dashboard/page";
import TransactionsPage from "@/pages/transactions/page";
import BudgetsPage from "@/pages/budgets/page";
import InvestmentPage from "@/pages/investment/page";
import AnalyticsPage from "@/pages/analytics/page";
import AiAssistantPage from "@/pages/ai_assistant/page";

export type RouteType = {
    path?: string;
    index?: boolean;
    element: JSX.Element;
}

const appRoutes: RouteType[] = [
    {
        index: true,
        element: <DashBoardPage />,
    },
    {
        path: '/pages/transactions',
        element: <TransactionsPage />,
    },
    {
        path: '/pages/budgets',
        element: <BudgetsPage />,
    },
    {
        path: '/pages/investment',
        element: <InvestmentPage />,
    },
    {
        path: '/pages/analytics',
        element: <AnalyticsPage />,
    },
    {
        path: '/pages/ai-assistant',
        element: <AiAssistantPage />,
    },
];

export default appRoutes;