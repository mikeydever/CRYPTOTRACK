import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider, useMutation } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { CsvImportForm } from '../components/CsvImportForm';

// Mock useMutation
jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useMutation: jest.fn((options) => ({
    mutate: jest.fn((variables) => {
      // Simulate asynchronous behavior
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (variables.includes('error')) {
            const error = new Error('Network error');
            if (options.onError) {
              options.onError(error);
            }
            reject(error);
          } else {
            const data = { message: 'Import successful!' };
            if (options.onSuccess) {
              options.onSuccess(data);
            }
            resolve(data);
          }
        }, 100); // Simulate a network delay
      });
    }),
    isLoading: false,
    isError: false,
    isSuccess: false,
    data: null,
    error: null,
  })),
}));

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

let queryClient;

const createWrapper = () => ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('CsvImportForm', () => {
  const mockOnImportSuccess = jest.fn();
  let mockMutate: jest.Mock;
  let capturedOptions: any;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    mockMutate = jest.fn();
    (useMutation as jest.Mock).mockImplementation((options) => {
      capturedOptions = options;
      return {
        mutate: mockMutate,
        isLoading: false,
        isError: false,
        isSuccess: false,
        data: null,
        error: null,
      };
    });
    jest.clearAllMocks();
  });

  test('renders correctly with file input and import button', () => {
    render(<CsvImportForm onImportSuccess={mockOnImportSuccess} />, { wrapper: createWrapper() });

    expect(screen.getByText('Import Transactions from CSV')).toBeInTheDocument();
    expect(screen.getByLabelText('Choose File')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Import CSV' })).toBeInTheDocument();
  });

  test('enables import button when a file is selected', () => {
    render(<CsvImportForm onImportSuccess={mockOnImportSuccess} />, { wrapper: createWrapper() });

    const fileInput = screen.getByLabelText('Choose File');
    const importButton = screen.getByRole('button', { name: 'Import CSV' });

    expect(importButton).toBeDisabled();

    const file = new File(['coinId,quantity\nbitcoin,1'], 'transactions.csv', { type: 'text/csv' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(importButton).not.toBeDisabled();
  });

  test('calls mutate with file content on import button click', async () => {
    render(<CsvImportForm onImportSuccess={mockOnImportSuccess} />, { wrapper: createWrapper() });

    const fileInput = screen.getByLabelText('Choose File');
    const importButton = screen.getByRole('button', { name: 'Import CSV' });

    const csvContent = 'coinId,quantity\nbitcoin,1';
    const file = new File([csvContent], 'transactions.csv', { type: 'text/csv' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    fireEvent.click(importButton);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledTimes(1);
      expect(mockMutate).toHaveBeenCalledWith(csvContent);
    });
  });

  test('displays success message and calls onImportSuccess on successful import', async () => {
    render(<CsvImportForm onImportSuccess={mockOnImportSuccess} />, { wrapper: createWrapper() });

    const fileInput = screen.getByLabelText('Choose File');
    const importButton = screen.getByRole('button', { name: 'Import CSV' });

    const csvContent = 'coinId,quantity\nbitcoin,1';
    const file = new File([csvContent], 'transactions.csv', { type: 'text/csv' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    fireEvent.click(importButton);

    // Simulate successful mutation
    await act(async () => {
      capturedOptions.onSuccess({ message: 'Import successful!' });
    });

    await waitFor(() => {
      expect(screen.getByText('Import successful!')).toBeInTheDocument();
      expect(mockOnImportSuccess).toHaveBeenCalledTimes(1);
    });
  });

  test('displays error message on failed import', async () => {
    render(<CsvImportForm onImportSuccess={mockOnImportSuccess} />, { wrapper: createWrapper() });

    const fileInput = screen.getByLabelText('Choose File');
    const importButton = screen.getByRole('button', { name: 'Import CSV' });

    const csvContent = 'error,quantity\nbitcoin,1'; // Content that triggers error
    const file = new File([csvContent], 'transactions.csv', { type: 'text/csv' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    fireEvent.click(importButton);

    // Simulate failed mutation
    await act(async () => {
      capturedOptions.onError(new Error('Network error'));
    });

    await waitFor(() => {
      expect(screen.getByText('Error: Network error')).toBeInTheDocument();
      expect(mockOnImportSuccess).not.toHaveBeenCalled();
    });
  });
});