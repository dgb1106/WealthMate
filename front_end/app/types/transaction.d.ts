export interface Transaction {
    id: string;
    userId: string;
    budgetId: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    description: string;
    date: string;
    createdAt: string;
    updatedAt: string;
}
export interface TransactionFormData {
    amount: number;
    type: 'income' | 'expense';
    category: string;
    description: string;
    date: string;
    budgetId: string;
}
export type TransactionAction = {
    type: 'SET_TRANSACTIONS';
    payload: Transaction[];
} | {
    type: 'ADD_TRANSACTION';
    payload: Transaction;
} | {
    type: 'UPDATE_TRANSACTION';
    payload: Transaction;
} | {
    type: 'DELETE_TRANSACTION';
    payload: string;
} | {
    type: 'SET_LOADING';
    payload: boolean;
} | {
    type: 'SET_ERROR';
    payload: string | null;
};
