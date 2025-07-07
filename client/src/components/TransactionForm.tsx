import React, { useState, useEffect } from 'react';
import { Transaction } from '../types/transaction';

interface TransactionFormProps {
  onSave: (transaction: Transaction) => void;
  onCancel: () => void;
  initialData?: Transaction | null;
}

export function TransactionForm({ onSave, onCancel, initialData }: TransactionFormProps) {
  const [coinId, setCoinId] = useState('');
  const [coinSymbol, setCoinSymbol] = useState(''); // Added coinSymbol state
  const [type, setType] = useState<'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState('');
  const [pricePerCoin, setPricePerCoin] = useState('');

  useEffect(() => {
    if (initialData) {
      setCoinId(initialData.coinId);
      setCoinSymbol(initialData.coinSymbol); // Set coinSymbol from initialData
      setType(initialData.type);
      setQuantity(initialData.quantity.toString());
      setPricePerCoin(initialData.pricePerCoin.toString());
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: initialData?.id,
      coinId,
      coinSymbol, // Added coinSymbol
      type,
      quantity: parseFloat(quantity),
      pricePerCoin: parseFloat(pricePerCoin),
      timestamp: initialData?.timestamp || new Date().toISOString(),
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
          <label htmlFor="coinSymbol" className="block text-sm font-medium mb-1">Coin Symbol</label>
          <input
            type="text"
            id="coinSymbol"
            value={coinSymbol}
            onChange={(e) => setCoinSymbol(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-md p-2"
            required
          />
        </div>
        <div>
          <label htmlFor="type" className="block text-sm font-medium mb-1">Type</label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value as 'buy' | 'sell')}
            className="w-full bg-gray-700 border border-gray-600 rounded-md p-2"
          >
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
          </select>
        </div>
        <div>
          <label htmlFor="quantity" className="block text-sm font-medium mb-1">Quantity</label>
          <input
            type="number"
            id="quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-md p-2"
            required
          />
        </div>
        <div>
          <label htmlFor="pricePerCoin" className="block text-sm font-medium mb-1">Price Per Coin</label>
          <input
            type="number"
            id="pricePerCoin"
            value={pricePerCoin}
            onChange={(e) => setPricePerCoin(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-md p-2"
            required
          />
        </div>
      </div>
      <div className="flex justify-end space-x-2 mt-4">
        <button type="button" onClick={onCancel} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
          Cancel
        </button>
        <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Save Transaction
        </button>
      </div>
    </form>
  );
}
