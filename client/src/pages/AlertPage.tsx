import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from '../types/alert';
import { AlertForm } from '../components/AlertForm';
import { AlertList } from '../components/AlertList';
import { fetchAlerts, createAlert, updateAlert, deleteAlert } from '../services/alert.service';

export function AlertPage() {
  const queryClient = useQueryClient();
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null);

  const { data: alerts, isLoading, error } = useQuery<Alert[], Error>({
    queryKey: ['alerts'],
    queryFn: fetchAlerts,
  });

  const createAlertMutation = useMutation({
    mutationFn: createAlert,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      setIsFormVisible(false);
    },
  });

  const updateAlertMutation = useMutation({
    mutationFn: (alert: Alert) => updateAlert(alert.id!, alert),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      setIsFormVisible(false);
      setEditingAlert(null);
    },
  });

  const deleteAlertMutation = useMutation({
    mutationFn: deleteAlert,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });

  const handleSave = (alert: Alert) => {
    if (editingAlert) {
      updateAlertMutation.mutate(alert);
    } else {
      createAlertMutation.mutate(alert);
    }
  };

  const handleCancel = () => {
    setIsFormVisible(false);
    setEditingAlert(null);
  };

  const handleEdit = (alert: Alert) => {
    setEditingAlert(alert);
    setIsFormVisible(true);
  };

  const handleDelete = (alertId: string) => {
    deleteAlertMutation.mutate(alertId);
  };

  if (isLoading) return <div data-testid="loading">Loading alerts...</div>;
  if (error) return <div data-testid="error">Error: {error.message}</div>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Price Alerts</h1>
        <button 
          onClick={() => {
            setIsFormVisible(!isFormVisible);
            setEditingAlert(null); // Clear editing state when toggling form
          }}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          data-testid="toggle-alert-form-button"
        >
          {isFormVisible ? 'Cancel' : 'Add Alert'}
        </button>
      </div>

      {isFormVisible && (
        <div data-testid="alert-form-container">
          <h2 className="text-xl font-semibold mb-2">{editingAlert ? 'Edit Alert' : 'Add New Alert'}</h2>
          <AlertForm onSave={handleSave} onCancel={handleCancel} initialData={editingAlert} />
        </div>
      )}

      <div data-testid="alert-list">
        <h2 className="text-xl font-semibold mb-2">Your Alerts</h2>
        {alerts && alerts.length > 0 ? (
          <AlertList alerts={alerts} onEdit={handleEdit} onDelete={handleDelete} />
        ) : (
          <p>No alerts found. Add one to get started.</p>
        )}
      </div>
    </div>
  );
}
