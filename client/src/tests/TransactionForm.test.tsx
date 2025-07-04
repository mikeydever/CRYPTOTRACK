import { render, screen, fireEvent } from '@testing-library/react';
import { TransactionForm } from '../components/TransactionForm';

describe('TransactionForm', () => {
  test('renders all form fields and buttons', () => {
    render(<TransactionForm onSave={() => {}} onCancel={() => {}} />);

    expect(screen.getByLabelText('Coin')).toBeInTheDocument();
    expect(screen.getByLabelText('Type')).toBeInTheDocument();
    expect(screen.getByLabelText('Quantity')).toBeInTheDocument();
    expect(screen.getByLabelText('Price Per Coin')).toBeInTheDocument();
    expect(screen.getByText('Save Transaction')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  test('calls onSave with the correct data when the form is submitted', () => {
    const handleSave = jest.fn();
    render(<TransactionForm onSave={handleSave} onCancel={() => {}} />);

    fireEvent.change(screen.getByLabelText('Coin'), { target: { value: 'bitcoin' } });
    fireEvent.change(screen.getByLabelText('Type'), { target: { value: 'buy' } });
    fireEvent.change(screen.getByLabelText('Quantity'), { target: { value: '0.5' } });
    fireEvent.change(screen.getByLabelText('Price Per Coin'), { target: { value: '45000' } });

    fireEvent.click(screen.getByText('Save Transaction'));

    expect(handleSave).toHaveBeenCalledWith({
      coinId: 'bitcoin',
      type: 'buy',
      quantity: 0.5,
      pricePerCoin: 45000,
      timestamp: expect.any(String),
    });
  });

  test('calls onCancel when the cancel button is clicked', () => {
    const handleCancel = jest.fn();
    render(<TransactionForm onSave={() => {}} onCancel={handleCancel} />);

    fireEvent.click(screen.getByText('Cancel'));

    expect(handleCancel).toHaveBeenCalledTimes(1);
  });
});
