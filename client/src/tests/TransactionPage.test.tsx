import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { TransactionPage } from '../pages/TransactionPage';

// Helper to create a new QueryClient for each test
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
  test('renders the page title and the add transaction button after loading', async () => {
    const queryClient = createTestQueryClient();
    // Mock the API call to return an empty array of transactions
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ([]),
    } as Response);

    render(<TransactionPage />, { wrapper: createWrapper(queryClient) });

    // Wait for the loading to complete and the title to appear
    await waitFor(() => {
      expect(screen.getByText('Transactions')).toBeInTheDocument();
    });

    // Check that the button is also visible
    expect(screen.getByText('Add Transaction')).toBeInTheDocument();
  });
});