import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Transaction } from '../types/transaction';
import { TransactionForm } from '../components/TransactionForm';
import { TransactionList } from '../components/TransactionList';

// Mock data for demonstration purposes
const mockTransactions: Transaction[] = [
  {
    id: '1',
    coinId: 'bitcoin',
    type: 'buy',
    quantity: 0.5,
    pricePerCoin: 45000,
    timestamp: new Date().toISOString(),
  },
  {
    id: '2',
    coinId: 'ethereum',
    type: 'sell',
    quantity: 2,
    pricePerCoin: 2200,
    timestamp: new Date().toISOString(),
  },
];

// Placeholder for the real API call
const fetchTransactions = async (): Promise<Transaction[]> => {
  // In a real app, this would fetch from /api/transactions
  return Promise.resolve(mockTransactions);
};

export function TransactionPage() {
  const [isFormVisible, setIsFormVisible] = useState(false);

  const { data: transactions, isLoading, error } = useQuery<Transaction[], Error>({
    queryKey: ['transactions'],
    queryFn: fetchTransactions,
  });

  const handleSave = (transaction: Transaction) => {
    console.log('Saving transaction:', transaction);
    // Here you would typically call a mutation to save the transaction
    setIsFormVisible(false);
  };

  const handleCancel = () => {
    setIsFormVisible(false);
  };

  if (isLoading) return <div data-testid="loading">Loading transactions...</div>;
  if (error) return <div data-testid="error">Error: {error.message}</div>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <button 
          onClick={() => setIsFormVisible(!isFormVisible)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {isFormVisible ? 'Cancel' : 'Add Transaction'}
        </button>
      </div>

      {isFormVisible && (
        <TransactionForm onSave={handleSave} onCancel={handleCancel} />
      )}

      <div data-testid="transaction-list">
        <h2 className="text-xl font-semibold mb-2">Your Transactions</h2>
        {transactions && transactions.length > 0 ? (
          <TransactionList transactions={transactions} />
        ) : (
          <p>No transactions found. Add one to get started.</p>
        )}
      </div>
    </div>
  );
}
