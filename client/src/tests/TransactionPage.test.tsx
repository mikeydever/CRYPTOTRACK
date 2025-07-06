import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { TransactionPage } from '../pages/TransactionPage';
import '@testing-library/jest-dom';
import * as TransactionService from '../services/transaction.service';

jest.mock('../services/transaction.service');

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

// Helper to wrap the component in a QueryClientProvider
const createWrapper = (client: QueryClient) => ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={client}>{children}</QueryClientProvider>
);

describe('TransactionPage', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    jest.clearAllMocks();
    queryClient.clear(); // Clear the query client cache before each test

    // Mock window.URL.createObjectURL and window.alert
    global.URL.createObjectURL = jest.fn();
    global.alert = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders the page title and the add transaction button after loading', async () => {
    (TransactionService.fetchTransactions as jest.Mock).mockResolvedValue([]);

    render(<TransactionPage />, { wrapper: createWrapper(queryClient) });

    await waitFor(() => {
      expect(screen.getByText('Transactions')).toBeInTheDocument();
    });

    expect(screen.getByText('Add Transaction')).toBeInTheDocument();
  });

  test('displays "No transactions found" message when no transactions are present', async () => {
    (TransactionService.fetchTransactions as jest.Mock).mockResolvedValue([]);

    render(<TransactionPage />, { wrapper: createWrapper(queryClient) });

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      expect(screen.getByText('No transactions found. Add one to get started.')).toBeInTheDocument();
    });
  });

  test('renders CsvImportForm component', async () => {
    (TransactionService.fetchTransactions as jest.Mock).mockResolvedValue([]);

    render(<TransactionPage />, { wrapper: createWrapper(queryClient) });

    await waitFor(() => {
      expect(screen.getByText('Import Transactions from CSV')).toBeInTheDocument();
    });
  });

  test('renders CSV import form with proper functionality', async () => {
    (TransactionService.fetchTransactions as jest.Mock).mockResolvedValue([]);

    render(<TransactionPage />, { wrapper: createWrapper(queryClient) });

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Import Transactions from CSV')).toBeInTheDocument();
    });

    // Verify the form has the expected elements
    expect(screen.getByLabelText('Choose File')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Import CSV' })).toBeInTheDocument();
  });

  test('adds a new transaction to the list after saving', async () => {
    const newTransaction = {
      id: 'new-trans-id',
      coinId: 'dogecoin',
      type: 'buy',
      quantity: 100,
      pricePerCoin: 0.5,
      timestamp: new Date().toISOString(),
    };

    (TransactionService.fetchTransactions as jest.Mock).mockResolvedValue([]);
    (TransactionService.createTransaction as jest.Mock).mockResolvedValue(newTransaction);

    render(<TransactionPage />, { wrapper: createWrapper(queryClient) });

    await waitFor(() => {
      expect(screen.getByText('Add Transaction')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Add Transaction'));

    await waitFor(() => {
      expect(screen.getByLabelText('Coin')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('Coin'), { target: { value: newTransaction.coinId } });
    fireEvent.change(screen.getByLabelText('Type'), { target: { value: newTransaction.type } });
    fireEvent.change(screen.getByLabelText('Quantity'), { target: { value: newTransaction.quantity } });
    fireEvent.change(screen.getByLabelText('Price Per Coin'), { target: { value: newTransaction.pricePerCoin } });

    fireEvent.click(screen.getByText('Save Transaction'));

    await waitFor(() => {
      expect(TransactionService.createTransaction).toHaveBeenCalledWith(expect.objectContaining({
        coinId: newTransaction.coinId,
        type: newTransaction.type,
        quantity: newTransaction.quantity,
        pricePerCoin: newTransaction.pricePerCoin,
      }));
    });
  });

  test('edits an existing transaction', async () => {
    const initialTransaction = {
      id: 'trans-to-edit',
      coinId: 'bitcoin',
      type: 'buy',
      quantity: 0.5,
      pricePerCoin: 40000,
      timestamp: new Date().toISOString(),
    };
    const updatedTransaction = { ...initialTransaction, quantity: 0.75, pricePerCoin: 42000 };

    (TransactionService.fetchTransactions as jest.Mock).mockResolvedValue([initialTransaction]);
    (TransactionService.updateTransaction as jest.Mock).mockResolvedValue(updatedTransaction);

    render(<TransactionPage />, { wrapper: createWrapper(queryClient) });

    await waitFor(() => {
      expect(screen.getByText('bitcoin')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId(`edit-transaction-${initialTransaction.id}`));

    await waitFor(() => {
      expect(screen.getByLabelText('Coin')).toHaveValue(initialTransaction.coinId);
      expect(screen.getByLabelText('Quantity')).toHaveValue(initialTransaction.quantity);
    });

    fireEvent.change(screen.getByLabelText('Quantity'), { target: { value: updatedTransaction.quantity } });
    fireEvent.change(screen.getByLabelText('Price Per Coin'), { target: { value: updatedTransaction.pricePerCoin } });

    fireEvent.click(screen.getByText('Save Transaction'));

    await waitFor(() => {
      expect(TransactionService.updateTransaction).toHaveBeenCalledWith(
        initialTransaction.id,
        expect.objectContaining({
          quantity: updatedTransaction.quantity,
          pricePerCoin: updatedTransaction.pricePerCoin,
        })
      );
    });
  });

  test('deletes a transaction', async () => {
    const transactionToDelete = {
      id: 'trans-to-delete',
      coinId: 'litecoin',
      type: 'buy',
      quantity: 5,
      pricePerCoin: 100,
      timestamp: new Date().toISOString(),
    };

    (TransactionService.fetchTransactions as jest.Mock).mockResolvedValue([transactionToDelete]);
    (TransactionService.deleteTransaction as jest.Mock).mockResolvedValue(undefined);

    render(<TransactionPage />, { wrapper: createWrapper(queryClient) });

    await waitFor(() => {
      expect(screen.getByText('litecoin')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId(`delete-transaction-${transactionToDelete.id}`));

    await waitFor(() => {
      expect(TransactionService.deleteTransaction).toHaveBeenCalledWith(transactionToDelete.id);
    });
  });

  test('exports transactions to CSV when export button is clicked', async () => {
    (TransactionService.fetchTransactions as jest.Mock).mockResolvedValue([]);
    (TransactionService.exportTransactionsToCsv as jest.Mock).mockResolvedValue('csv data');

    render(<TransactionPage />, { wrapper: createWrapper(queryClient) });

    await waitFor(() => {
      expect(screen.getByText('Export to CSV')).toBeInTheDocument();
    });

    const link = document.createElement('a');
    const clickSpy = jest.spyOn(link, 'click').mockImplementation(() => {});
    jest.spyOn(document, 'createElement').mockReturnValue(link);

    fireEvent.click(screen.getByRole('button', { name: 'Export to CSV' }));

    await waitFor(() => {
      expect(clickSpy).toHaveBeenCalledTimes(1);
    });

    clickSpy.mockRestore();
  });
});
