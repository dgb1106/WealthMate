import DashBoardPage from "@/pages/dashboard/page";
import TransactionsPage from "@/pages/transactions/page";
import GoalsPage from "@/pages/goals/page";
import BudgetsPage from "@/pages/budgets/page";
import InvestmentPage from "@/pages/investment/page";
import AnalyticsPage from "@/pages/analytics/page";
import FamilyPage from "@/pages/family/page";
import FamilyGroupPage from "@/pages/family/[groupId]/page";
import AiAssistantPage from "@/pages/ai_assistant/page";
import ProfilePage from "@/pages/profile/page";

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
        path: '/pages/goals',
        element: <GoalsPage />,
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
        path: '/pages/family',
        element: <FamilyPage />,
    },
    {
        path: '/pages/family/:groupId',
        element: <FamilyGroupPage />,
    },
    {
        path: '/pages/ai-assistant',
        element: <AiAssistantPage />,
    },
    {
        path: '/pages/profile',
        element: <ProfilePage />,
    },
];

export default appRoutes;