// Transaction service to handle all API calls related to transactions

interface Transaction {
  id: string;
  description: string;
  amount: number;
  created_at: string;
  category: {
    id: string;
    name: string;
  };
}

interface TransactionCreateData {
  categoryId: string;
  amount: number;
  description: string;
}

interface TransactionUpdateData {
  categoryId: string;
  amount: number;
  description: string;
}

interface FilterOptions {
  month?: string; 
  year?: string;
  type?: string;
  categoryId?: string;
}

const getAuthToken = () => localStorage.getItem('authToken');

const transactionService = {
  async getTransactions(filters: FilterOptions = {}): Promise<Transaction[]> {
    const { month, year, type, categoryId } = filters;
    const token = getAuthToken();
    let endpoint = `${process.env.NEXT_PUBLIC_API_URL}/transactions`;
    const adjustedMonth = month && month !== 'all' ? parseInt(month) - 1 : null;
    if (categoryId && categoryId !== 'all') {
      if (month !== 'all' && year) {
        endpoint = `${process.env.NEXT_PUBLIC_API_URL}/transactions/category/${categoryId}/month?month=${adjustedMonth}&year=${year}`;
      } else {
        endpoint = `${process.env.NEXT_PUBLIC_API_URL}/transactions/category/${categoryId}`;
      }
    }
    else if (month !== 'all' && year) {
      if (type === 'income') {
        endpoint = `${process.env.NEXT_PUBLIC_API_URL}/transactions/income/month?month=${adjustedMonth}&year=${year}`;
      } else if (type === 'expenses') {
        endpoint = `${process.env.NEXT_PUBLIC_API_URL}/transactions/expenses/month?month=${adjustedMonth}&year=${year}`;
      } else {
        endpoint = `${process.env.NEXT_PUBLIC_API_URL}/transactions/summary/month?month=${adjustedMonth}&year=${year}`;
      }
    } 
    else if (type === 'income') {
      endpoint = `${process.env.NEXT_PUBLIC_API_URL}/transactions/income`;
    } else if (type === 'expenses') {
      endpoint = `${process.env.NEXT_PUBLIC_API_URL}/transactions/expenses`;
    }
    
    const response = await fetch(endpoint, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch transactions');
    }
    
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  },
  
  async createTransaction(transactionData: TransactionCreateData): Promise<Transaction> {
    const token = getAuthToken();
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(transactionData),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server error:', errorText);
      throw new Error('Failed to add transaction');
    }
    
    return await response.json();
  },
  
  async updateTransaction(id: string, transactionData: TransactionUpdateData): Promise<Transaction> {
    const token = getAuthToken();
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/transactions/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(transactionData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update transaction');
    }
    
    return await response.json();
  },
  
  async deleteTransaction(id: string): Promise<void> {
    const token = getAuthToken();
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/transactions/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete transaction');
    }
  }
};

export default transactionService;