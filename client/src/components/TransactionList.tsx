import React from 'react';
import { Transaction } from '../types/transaction';

interface TransactionListProps {
  transactions: Transaction[];
}

export function TransactionList({ transactions }: TransactionListProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-gray-700 rounded-lg shadow-md">
        <thead>
          <tr className="bg-gray-600 text-white uppercase text-sm leading-normal">
            <th className="py-3 px-6 text-left">Coin</th>
            <th className="py-3 px-6 text-left">Type</th>
            <th className="py-3 px-6 text-left">Quantity</th>
            <th className="py-3 px-6 text-left">Price</th>
            <th className="py-3 px-6 text-left">Timestamp</th>
            <th className="py-3 px-6 text-left">Actions</th>
          </tr>
        </thead>
        <tbody className="text-gray-200 text-sm font-light">
          {transactions.map((transaction) => (
            <tr key={transaction.id} className="border-b border-gray-600 hover:bg-gray-600">
              <td className="py-3 px-6 text-left whitespace-nowrap">{transaction.coinId}</td>
              <td className="py-3 px-6 text-left">{transaction.type}</td>
              <td className="py-3 px-6 text-left">{transaction.quantity}</td>
              <td className="py-3 px-6 text-left">${transaction.pricePerCoin.toFixed(2)}</td>
              <td className="py-3 px-6 text-left">{new Date(transaction.timestamp).toLocaleDateString()}</td>
              <td className="py-3 px-6 text-left">
                <button className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded text-xs mr-2">Edit</button>
                <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
