import { Transaction } from '../types/transaction';

export const fetchTransactions = async (): Promise<Transaction[]> => {
  // In a real app, this would fetch from /api/transactions
  return Promise.resolve([]);
};

export const createTransaction = async (transaction: Transaction): Promise<Transaction> => {
  // In a real app, this would be a POST request to /api/transactions
  return Promise.resolve(transaction);
};

export const updateTransaction = async (id: string, transaction: Transaction): Promise<Transaction> => {
  // In a real app, this would be a PUT request to /api/transactions/:id
  return Promise.resolve(transaction);
};

export const deleteTransaction = async (id: string): Promise<void> => {
  // In a real app, this would be a DELETE request to /api/transactions/:id
  return Promise.resolve();
};

export const exportTransactionsToCsv = async (): Promise<string> => {
  // In a real app, this would fetch from /api/transactions/export
  return Promise.resolve('coinId,coinSymbol\nbitcoin,BTC');
};

export const importTransactionsFromCsv = async (file: File): Promise<void> => {
  // In a real app, this would be a POST request to /api/transactions/import
  return Promise.resolve();
};