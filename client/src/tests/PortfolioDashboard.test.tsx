import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { PortfolioDashboard } from '../components/PortfolioDashboard';

// Mock data for our tests
const mockData = {
  totalValue: 33500,
  totalProfitLoss: 3485,
  totalProfitLossPercent: 10.4,
  holdings: [
    {
      coinId: 'bitcoin',
      coinSymbol: 'BTC',
      quantity: 0.5,
      averagePrice: 40020,
      currentPrice: 45000,
      totalValue: 22500,
      profitLoss: 2490,
      profitLossPercent: 6.22,
    },
    {
      coinId: 'ethereum',
      coinSymbol: 'ETH',
      quantity: 5,
      averagePrice: 2001,
      currentPrice: 2200,
      totalValue: 11000,
      profitLoss: 995,
      profitLossPercent: 9.94,
    },
  ],
};

// Helper to create a new QueryClient for each test, ensuring test isolation
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // Disable retries for faster test execution
    },
  },
});

// Helper to wrap the component in a QueryClientProvider
const createWrapper = (client: QueryClient) => ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={client}>{children}</QueryClientProvider>
);

describe('PortfolioDashboard', () => {
  
  // Restore all mocks after each test to prevent test pollution
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('displays loading state initially', () => {
    const queryClient = createTestQueryClient();
    // Mock a fetch that never resolves to keep the component in a loading state
    jest.spyOn(global, 'fetch').mockImplementation(() => new Promise(() => {}));
    
    render(<PortfolioDashboard />, { wrapper: createWrapper(queryClient) });
    
    // The loading indicator should be visible
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  test('displays portfolio value and profit/loss on success', async () => {
    const queryClient = createTestQueryClient();
    // Mock a successful fetch response
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => (mockData),
    } as Response);

    render(<PortfolioDashboard />, { wrapper: createWrapper(queryClient) });

    // Wait for the component to render the data
    await waitFor(() => {
      // Check for the total value with a regex to handle formatting
      expect(screen.getByText(/\$\s*33500\.00/)).toBeInTheDocument();
    });

    // Check for the profit/loss information
    const profitLoss = screen.getByText(/\+\s*3485\.00\s*\(\s*10\.40\s*%\)/);
    expect(profitLoss).toBeInTheDocument();
    expect(profitLoss).toHaveClass('text-green-500');
  });

  test('displays error message on fetch failure', async () => {
    const queryClient = createTestQueryClient();
    // Mock a failed fetch response
    jest.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error'));

    render(<PortfolioDashboard />, { wrapper: createWrapper(queryClient) });

    // Wait for the error message to be displayed
    await waitFor(() => {
      expect(screen.getByTestId('error')).toBeInTheDocument();
    });
    
    // Verify the content of the error message
    expect(screen.getByText('Error: Network error')).toBeInTheDocument();
  });
});