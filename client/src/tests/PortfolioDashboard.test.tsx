import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { PortfolioDashboard } from '../components/PortfolioDashboard';

// Mock the @tanstack/react-query module
jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQuery: jest.fn(),
}));

const mockUseQuery = useQuery as jest.Mock;

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

// Helper to create a new QueryClient for each test
const createTestQueryClient = () => new QueryClient();

// Helper to wrap the component in a QueryClientProvider
const createWrapper = (client: QueryClient) => ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={client}>{children}</QueryClientProvider>
);

describe('PortfolioDashboard', () => {
  
  beforeEach(() => {
    // Reset the mock before each test
    mockUseQuery.mockClear();
  });

  test('displays loading state initially', () => {
    mockUseQuery.mockReturnValue({ isLoading: true, error: null, data: null });
    const queryClient = createTestQueryClient();
    render(<PortfolioDashboard />, { wrapper: createWrapper(queryClient) });
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  test('displays portfolio value and profit/loss on success', () => {
    mockUseQuery.mockReturnValue({ isLoading: false, error: null, data: mockData });
    const queryClient = createTestQueryClient();
    render(<PortfolioDashboard />, { wrapper: createWrapper(queryClient) });
    expect(screen.getByText(/\$\s*33500\.00/)).toBeInTheDocument();
    const profitLoss = screen.getByText(/\+\s*3485\.00\s*\(\s*10\.40\s*%\)/);
    expect(profitLoss).toBeInTheDocument();
    expect(profitLoss).toHaveClass('text-green-500');
  });

  test('displays error message on fetch failure', () => {
    mockUseQuery.mockReturnValue({ isLoading: false, error: new Error('Network error'), data: null });
    const queryClient = createTestQueryClient();
    render(<PortfolioDashboard />, { wrapper: createWrapper(queryClient) });
    expect(screen.getByTestId('error')).toBeInTheDocument();
    expect(screen.getByText('Error: Network error')).toBeInTheDocument();
  });

  test('displays holdings table correctly', () => {
    mockUseQuery.mockReturnValue({ isLoading: false, error: null, data: mockData });
    const queryClient = createTestQueryClient();
    render(<PortfolioDashboard />, { wrapper: createWrapper(queryClient) });

    // Check for table headers
    expect(screen.getByText('Coin')).toBeInTheDocument();
    expect(screen.getByText('Quantity')).toBeInTheDocument();
    
    // Check for Bitcoin data
    expect(screen.getByText('BTC')).toBeInTheDocument();
    expect(screen.getByText('0.5000')).toBeInTheDocument();
    expect(screen.getByText('$40020.00')).toBeInTheDocument();

    // Check for Ethereum data
    expect(screen.getByText('ETH')).toBeInTheDocument();
    expect(screen.getByText('5.0000')).toBeInTheDocument();
    expect(screen.getByText('$2001.00')).toBeInTheDocument();
  });

  test('useQuery is called with a refetchInterval of 30000', () => {
    mockUseQuery.mockReturnValue({ isLoading: true, error: null, data: null });
    const queryClient = createTestQueryClient();
    render(<PortfolioDashboard />, { wrapper: createWrapper(queryClient) });

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        refetchInterval: 30000,
      })
    );
  });
});
