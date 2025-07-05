import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import * as TransactionService from '../services/transaction.service';
import { TransactionPage } from '../pages/TransactionPage';

jest.mock('../services/transaction.service', () => ({
  fetchTransactions: jest.fn(),
}));

import { useMutation } from '@tanstack/react-query';

// Mock useMutation
jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useMutation: jest.fn(),
}));

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
    
    // Set up useMutation mock
    (useMutation as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      isLoading: false,
      isError: false,
      isSuccess: false,
      data: null,
      error: null,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders the page title and the add transaction button after loading', async () => {
    (TransactionService.fetchTransactions as jest.Mock).mockResolvedValueOnce([]);

    render(<TransactionPage />, { wrapper: createWrapper(queryClient) });

    await waitFor(() => {
      expect(screen.getByText('Transactions')).toBeInTheDocument();
    });

    expect(screen.getByText('Add Transaction')).toBeInTheDocument();
  });

  test('displays "No transactions found" message when no transactions are present', async () => {
    (TransactionService.fetchTransactions as jest.Mock).mockResolvedValueOnce([]);

    render(<TransactionPage />, { wrapper: createWrapper(queryClient) });

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      expect(screen.getByText('No transactions found. Add one to get started.')).toBeInTheDocument();
    });
  });

  test('renders CsvImportForm component', async () => {
    (TransactionService.fetchTransactions as jest.Mock).mockResolvedValueOnce([]);

    render(<TransactionPage />, { wrapper: createWrapper(queryClient) });

    await waitFor(() => {
      expect(screen.getByText('Import Transactions from CSV')).toBeInTheDocument();
    });
  });

  test('renders CSV import form with proper functionality', async () => {
    (TransactionService.fetchTransactions as jest.Mock).mockResolvedValueOnce([]);

    render(<TransactionPage />, { wrapper: createWrapper(queryClient) });

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Import Transactions from CSV')).toBeInTheDocument();
    });

    // Verify the form has the expected elements
    expect(screen.getByLabelText('Choose File')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Import CSV' })).toBeInTheDocument();
  });
});
