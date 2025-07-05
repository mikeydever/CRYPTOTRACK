import { Transaction } from '../types/transaction';

export const fetchTransactions = async (): Promise<Transaction[]> => {
  // In a real app, this would fetch from /api/transactions
  return Promise.resolve([]);
};