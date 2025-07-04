import { render, screen, fireEvent } from '@testing-library/react';
import { AlertForm } from '../components/AlertForm';

describe('AlertForm', () => {
  test('renders all form fields and buttons', () => {
    render(<AlertForm onSave={() => {}} onCancel={() => {}} />);

    expect(screen.getByLabelText('Coin ID')).toBeInTheDocument();
    expect(screen.getByLabelText('Target Price')).toBeInTheDocument();
    expect(screen.getByLabelText('Direction')).toBeInTheDocument();
    expect(screen.getByText('Save Alert')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  test('calls onSave with the correct data when the form is submitted', () => {
    const handleSave = jest.fn();
    render(<AlertForm onSave={handleSave} onCancel={() => {}} />);

    fireEvent.change(screen.getByLabelText('Coin ID'), { target: { value: 'bitcoin' } });
    fireEvent.change(screen.getByLabelText('Target Price'), { target: { value: '50000' } });
    fireEvent.change(screen.getByLabelText('Direction'), { target: { value: 'above' } });

    fireEvent.click(screen.getByText('Save Alert'));

    expect(handleSave).toHaveBeenCalledWith({
      coinId: 'bitcoin',
      targetPrice: 50000,
      direction: 'above',
    });
  });

  test('calls onCancel when the cancel button is clicked', () => {
    const handleCancel = jest.fn();
    render(<AlertForm onSave={() => {}} onCancel={handleCancel} />);

    fireEvent.click(screen.getByText('Cancel'));

    expect(handleCancel).toHaveBeenCalledTimes(1);
  });
});
