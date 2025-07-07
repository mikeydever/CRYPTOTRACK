import { render, screen } from '@testing-library/react';
import { AlertList } from '../components/AlertList';
import { Alert } from '../types/alert';

const mockAlerts: Alert[] = [
  {
    id: '1',
    coinId: 'bitcoin',
    targetPrice: 50000,
    direction: 'above',
    triggered: false,
  },
  {
    id: '2',
    coinId: 'ethereum',
    targetPrice: 2000,
    direction: 'below',
    triggered: true,
  },
];

describe('AlertList', () => {
  test('renders a table with the correct number of rows', () => {
    render(<AlertList alerts={mockAlerts} onEdit={jest.fn()} onDelete={jest.fn()} />);

    const rows = screen.getAllByRole('row');
    // The header row plus the two data rows
    expect(rows).toHaveLength(3);
  });

  test('renders the correct data in each row', () => {
    render(<AlertList alerts={mockAlerts} onEdit={jest.fn()} onDelete={jest.fn()} />);

    expect(screen.getByText('bitcoin')).toBeInTheDocument();
    expect(screen.getByText('$50000.00')).toBeInTheDocument();
    expect(screen.getByText('above')).toBeInTheDocument();
    expect(screen.getByText('No')).toBeInTheDocument();

    expect(screen.getByText('ethereum')).toBeInTheDocument();
    expect(screen.getByText('$2000.00')).toBeInTheDocument();
    expect(screen.getByText('below')).toBeInTheDocument();
    expect(screen.getByText('Yes')).toBeInTheDocument();
  });
});
