import { Transaction } from '../types/transaction';

const API_BASE_URL = 'http://localhost:5001/api/transactions';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

export const fetchTransactions = async (): Promise<Transaction[]> => {
  const response = await fetch(API_BASE_URL, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch transactions');
  }
  const data = await response.json();
  return data;
};

export const createTransaction = async (transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction> => {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(transaction),
  });
  if (!response.ok) {
    throw new Error('Failed to create transaction');
  }
  const data = await response.json();
  return data;
};

export const updateTransaction = async (id: string, transaction: Partial<Omit<Transaction, 'id' | 'createdAt'>>): Promise<Transaction> => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(transaction),
  });
  if (!response.ok) {
    throw new Error('Failed to update transaction');
  }
  const data = await response.json();
  return data;
};

export const deleteTransaction = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to delete transaction');
  }
};

export const exportTransactionsToCsv = async (): Promise<string> => {
  const response = await fetch(`${API_BASE_URL}/export`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to export transactions');
  }
  return response.text();
};

export const importTransactionsFromCsv = async (file: File): Promise<void> => {
  const formData = new FormData();
  formData.append('csv', file);

  const response = await fetch(`${API_BASE_URL}/import`, {
    method: 'POST',
    headers: {
      'Authorization': getAuthHeaders().Authorization,
    },
    body: formData,
  });
  if (!response.ok) {
    throw new Error('Failed to import transactions');
  }
};