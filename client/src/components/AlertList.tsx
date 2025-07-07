import React from 'react';
import { Alert } from '../types/alert';

interface AlertListProps {
  alerts: Alert[];
  onEdit: (alert: Alert) => void;
  onDelete: (alertId: string) => void;
}

export function AlertList({ alerts, onEdit, onDelete }: AlertListProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-gray-700 rounded-lg shadow-md">
        <thead>
          <tr className="bg-gray-600 text-white uppercase text-sm leading-normal">
            <th className="py-3 px-6 text-left">Coin</th>
            <th className="py-3 px-6 text-left">Target Price</th>
            <th className="py-3 px-6 text-left">Direction</th>
            <th className="py-3 px-6 text-left">Triggered</th>
            <th className="py-3 px-6 text-left">Actions</th>
          </tr>
        </thead>
        <tbody className="text-gray-200 text-sm font-light">
          {alerts.map((alert) => (
            <tr key={alert.id} className="border-b border-gray-600 hover:bg-gray-600">
              <td className="py-3 px-6 text-left whitespace-nowrap">{alert.coinId}</td>
              <td className="py-3 px-6 text-left">${alert.targetPrice.toFixed(2)}</td>
              <td className="py-3 px-6 text-left">{alert.direction}</td>
              <td className="py-3 px-6 text-left">{alert.triggered ? 'Yes' : 'No'}</td>
              <td className="py-3 px-6 text-left">
                <button 
                  onClick={() => onEdit(alert)}
                  data-testid={`edit-alert-${alert.id}`}
                  className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded text-xs mr-2">Edit</button>
                <button 
                  onClick={() => onDelete(alert.id!)}
                  data-testid={`delete-alert-${alert.id}`}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
