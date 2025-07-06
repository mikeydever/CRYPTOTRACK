import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Transaction } from '../types/transaction';
import { TransactionForm } from '../components/TransactionForm';
import { TransactionList } from '../components/TransactionList';
import { CsvImportForm } from '../components/CsvImportForm';
import { fetchTransactions, exportTransactionsToCsv, createTransaction, updateTransaction, deleteTransaction } from '../services/transaction.service';

export function TransactionPage() {
  const queryClient = useQueryClient();
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const { data: transactions, isLoading, error, refetch } = useQuery<Transaction[], Error>({
    queryKey: ['transactions'],
    queryFn: fetchTransactions,
  });

  const createTransactionMutation = useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setIsFormVisible(false);
    },
  });

  const updateTransactionMutation = useMutation({
    mutationFn: (transaction: Transaction) => updateTransaction(transaction.id!, transaction),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setIsFormVisible(false);
      setEditingTransaction(null);
    },
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });

  const handleSave = (transaction: Transaction) => {
    if (editingTransaction) {
      updateTransactionMutation.mutate(transaction);
    } else {
      createTransactionMutation.mutate(transaction);
    }
  };

  const handleCancel = () => {
    setIsFormVisible(false);
    setEditingTransaction(null);
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsFormVisible(true);
  };

  const handleDelete = (transactionId: string) => {
    deleteTransactionMutation.mutate(transactionId);
  };

  const handleImportSuccess = () => {
    refetch(); // Refetch transactions after successful import
  };

  const handleExportCsv = async () => {
    try {
      const csvData = await exportTransactionsToCsv();
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', 'transactions.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to export CSV:', err);
      alert('Failed to export transactions. Please try again.');
    }
  };

  if (isLoading) return <div data-testid="loading">Loading transactions...</div>;
  if (error) return <div data-testid="error">Error: {error.message}</div>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <button 
          onClick={() => {
            setIsFormVisible(!isFormVisible);
            setEditingTransaction(null); // Clear editing state when toggling form
          }}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {isFormVisible ? 'Cancel' : 'Add Transaction'}
        </button>
        <button
          onClick={handleExportCsv}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ml-2"
        >
          Export to CSV
        </button>
      </div>

      {isFormVisible && (
        <div data-testid="transaction-form-container">
          <h2 className="text-xl font-semibold mb-2">{editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}</h2>
          <TransactionForm onSave={handleSave} onCancel={handleCancel} initialData={editingTransaction} />
        </div>
      )}

      <div className="mt-4">
        <CsvImportForm onImportSuccess={handleImportSuccess} />
      </div>

      <div data-testid="transaction-list">
        <h2 className="text-xl font-semibold mb-2">Your Transactions</h2>
        {transactions && transactions.length > 0 ? (
          <TransactionList transactions={transactions} onEdit={handleEdit} onDelete={handleDelete} />
        ) : (
          <p>No transactions found. Add one to get started.</p>
        )}
      </div>
    </div>
  );
}
