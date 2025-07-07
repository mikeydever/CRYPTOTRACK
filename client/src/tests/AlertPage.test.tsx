import { render, screen, waitFor, fireEvent, within, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { AlertPage } from '../pages/AlertPage';
import { fetchAlerts } from '../services/alert.service';

jest.mock('../services/alert.service');

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

let queryClient: QueryClient;

const createWrapper = () => ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('AlertPage', () => {
  beforeEach(() => {
    queryClient = createTestQueryClient();
    jest.clearAllMocks();
    queryClient.clear(); // Clear the query client cache before each test
  });

  test('renders the page title and the add alert button after loading', async () => {
    // Mock the API call to return an empty array of alerts
    (fetchAlerts as jest.Mock).mockResolvedValueOnce([]);

    render(<AlertPage />, { wrapper: createWrapper() });

    // Wait for the loading to complete and the title to appear
    await waitFor(() => {
      expect(screen.getByText('Price Alerts')).toBeInTheDocument();
    });

    // Check that the button is also visible
    expect(screen.getByRole('button', { name: 'Add Alert' })).toBeInTheDocument();
  });

  test('displays "No alerts found" message when no alerts are present', async () => {
    (fetchAlerts as jest.Mock).mockResolvedValueOnce([]);

    render(<AlertPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      expect(screen.getByText('No alerts found. Add one to get started.')).toBeInTheDocument();
    });
  });

  test('shows and hides the alert form', async () => {
    (fetchAlerts as jest.Mock).mockResolvedValueOnce([]);

    render(<AlertPage />, { wrapper: createWrapper() });

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByTestId('toggle-alert-form-button')).toHaveTextContent('Add Alert');
    });

    // Click Add Alert button to show form
    fireEvent.click(screen.getByTestId('toggle-alert-form-button'));
    await waitFor(() => {
      expect(screen.getByLabelText('Coin ID')).toBeInTheDocument(); // Check for a form field
      expect(screen.getByText('Add New Alert')).toBeInTheDocument();
      expect(screen.getByTestId('alert-form-cancel-button')).toBeInTheDocument();
      expect(screen.getByTestId('toggle-alert-form-button')).toHaveTextContent('Cancel');
    });

    // Click Cancel button to hide form
    fireEvent.click(screen.getByTestId('alert-form-cancel-button'));
    await waitFor(() => {
      expect(screen.queryByLabelText('Coin ID')).not.toBeInTheDocument(); // Check for a form field
      expect(screen.queryByText('Add New Alert')).not.toBeInTheDocument();
      expect(screen.getByTestId('toggle-alert-form-button')).toHaveTextContent('Add Alert');
    });
  });

  test('adds a new alert to the list after saving', async () => {
    // Mock initial fetch to return empty array
    (fetchAlerts as jest.Mock).mockResolvedValueOnce([]);

    render(<AlertPage />, { wrapper: createWrapper() });

    // Wait for initial load and for fetchAlerts to be called
    await waitFor(() => {
      expect(fetchAlerts).toHaveBeenCalledTimes(1);
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument(); // Ensure loading has finished
      expect(screen.getByText('No alerts found. Add one to get started.')).toBeInTheDocument();
    });

    // Click Add Alert button
    fireEvent.click(screen.getByTestId('toggle-alert-form-button'));

    await waitFor(() => {
      expect(screen.getByLabelText('Coin ID')).toBeInTheDocument();
    });

    // Fill and submit form
    fireEvent.change(screen.getByLabelText('Coin ID'), { target: { value: 'dogecoin' } });
    fireEvent.change(screen.getByLabelText('Target Price'), { target: { value: '0.5' } });
    fireEvent.change(screen.getByLabelText('Direction'), { target: { value: 'above' } });
    
    // Mock the fetchAlerts to return the new alert after the save operation
    (fetchAlerts as jest.Mock).mockResolvedValueOnce([
      {
        id: 'new-alert-id',
        coinId: 'dogecoin',
        targetPrice: 0.5,
        direction: 'above',
        triggered: false,
      },
    ]);

    fireEvent.click(screen.getByRole('button', { name: 'Save Alert' }));

    await act(async () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    });

    // Wait for the new alert to appear in the list
    await waitFor(() => {
      expect(fetchAlerts).toHaveBeenCalledTimes(2);
      expect(screen.getByText('dogecoin')).toBeInTheDocument();
      expect(screen.getByText('$0.50')).toBeInTheDocument();
      expect(screen.getByText('above')).toBeInTheDocument();
    });
  });
});