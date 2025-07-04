import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Alert } from '../types/alert';
import { AlertForm } from '../components/AlertForm';
import { AlertList } from '../components/AlertList';

// Mock data for demonstration purposes
import { fetchAlerts } from '../services/alert.service';

export function AlertPage() {
  const [isFormVisible, setIsFormVisible] = useState(false);

  const { data: alerts, isLoading, error } = useQuery<Alert[], Error>({
    queryKey: ['alerts'],
    queryFn: fetchAlerts,
  });

  const handleSave = (alert: Alert) => {
    // Here you would typically call a mutation to save the alert
    setIsFormVisible(false);
  };

  const handleCancel = () => {
    setIsFormVisible(false);
  };

  if (isLoading) return <div data-testid="loading">Loading alerts...</div>;
  if (error) return <div data-testid="error">Error: {error.message}</div>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Price Alerts</h1>
        <button 
          onClick={() => setIsFormVisible(!isFormVisible)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          data-testid="toggle-alert-form-button"
        >
          {isFormVisible ? 'Cancel' : 'Add Alert'}
        </button>
      </div>

      {isFormVisible && (
        <div data-testid="alert-form-container">
          <h2 className="text-xl font-semibold mb-2">Add New Alert</h2>
          <AlertForm onSave={handleSave} onCancel={handleCancel} />
        </div>
      )}

      <div data-testid="alert-list">
        <h2 className="text-xl font-semibold mb-2">Your Alerts</h2>
        {alerts && alerts.length > 0 ? (
          <AlertList alerts={alerts} />
        ) : (
          <p>No alerts found. Add one to get started.</p>
        )}
      </div>
    </div>
  );
}
