import { Alert } from '../types/alert';

const API_BASE_URL = 'http://localhost:5001/api/alerts';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

export const fetchAlerts = async (): Promise<Alert[]> => {
  const response = await fetch(API_BASE_URL, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch alerts');
  }
  const data = await response.json();
  return data.data;
};

export const createAlert = async (alert: Omit<Alert, 'id' | 'triggered' | 'createdAt'>): Promise<Alert> => {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(alert),
  });
  if (!response.ok) {
    throw new Error('Failed to create alert');
  }
  const data = await response.json();
  return data.data;
};

export const updateAlert = async (id: string, alert: Partial<Omit<Alert, 'id' | 'triggered' | 'createdAt'>>): Promise<Alert> => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(alert),
  });
  if (!response.ok) {
    throw new Error('Failed to update alert');
  }
  const data = await response.json();
  return data.data;
};

export const deleteAlert = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to delete alert');
  }
};
