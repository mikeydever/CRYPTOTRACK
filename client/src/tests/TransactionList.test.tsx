import { render, screen } from '@testing-library/react';
import { TransactionList } from '../components/TransactionList';
import { Transaction } from '../types/transaction';

const mockTransactions: Transaction[] = [
  {
    id: '1',
    coinId: 'bitcoin',
    coinSymbol: 'BTC',
    type: 'buy',
    quantity: 0.5,
    pricePerCoin: 45000,
    timestamp: new Date().toISOString(),
  },
  {
    id: '2',
    coinId: 'ethereum',
    coinSymbol: 'ETH',
    type: 'sell',
    quantity: 2,
    pricePerCoin: 2200,
    timestamp: new Date().toISOString(),
  },
];

describe('TransactionList', () => {
  test('renders a table with the correct number of rows', () => {
    render(<TransactionList transactions={mockTransactions} onEdit={jest.fn()} onDelete={jest.fn()} />);

    const rows = screen.getAllByRole('row');
    // The header row plus the two data rows
    expect(rows).toHaveLength(3);
  });

  test('renders the correct data in each row', () => {
    render(<TransactionList transactions={mockTransactions} onEdit={jest.fn()} onDelete={jest.fn()} />);

    expect(screen.getByText('bitcoin')).toBeInTheDocument();
    expect(screen.getByText('buy')).toBeInTheDocument();
    expect(screen.getByText('0.5')).toBeInTheDocument();
    expect(screen.getByText('$45000.00')).toBeInTheDocument();

    expect(screen.getByText('ethereum')).toBeInTheDocument();
    expect(screen.getByText('sell')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('$2200.00')).toBeInTheDocument();
  });
});
