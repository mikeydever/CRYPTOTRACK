import React, { useState, useEffect } from 'react';
import { Alert } from '../types/alert';

interface AlertFormProps {
  onSave: (alert: Alert) => void;
  onCancel: () => void;
  initialData?: Alert | null;
}

export function AlertForm({ onSave, onCancel, initialData }: AlertFormProps) {
  const [coinId, setCoinId] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [direction, setDirection] = useState<'above' | 'below'>('above');

  useEffect(() => {
    if (initialData) {
      setCoinId(initialData.coinId);
      setTargetPrice(initialData.targetPrice.toString());
      setDirection(initialData.direction);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: initialData?.id,
      coinId,
      targetPrice: parseFloat(targetPrice),
      direction,
      triggered: initialData?.triggered || false, // Preserve triggered status if editing
      createdAt: initialData?.createdAt || new Date(), // Preserve createdAt if editing
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 p-4 rounded-lg mb-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="coinId" className="block text-sm font-medium mb-1">Coin ID</label>
          <input
            type="text"
            id="coinId"
            value={coinId}
            onChange={(e) => setCoinId(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-md p-2"
            required
          />
        </div>
        <div>
          <label htmlFor="targetPrice" className="block text-sm font-medium mb-1">Target Price</label>
          <input
            type="number"
            id="targetPrice"
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-md p-2"
            required
          />
        </div>
        <div>
          <label htmlFor="direction" className="block text-sm font-medium mb-1">Direction</label>
          <select
            id="direction"
            value={direction}
            onChange={(e) => setDirection(e.target.value as 'above' | 'below')}
            className="w-full bg-gray-700 border border-gray-600 rounded-md p-2"
          >
            <option value="above">Above</option>
            <option value="below">Below</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end space-x-2 mt-4">
        <button type="button" onClick={onCancel} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded" data-testid="alert-form-cancel-button">
          Cancel
        </button>
        <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Save Alert
        </button>
      </div>
    </form>
  );
}
