import { Alert } from '../types/alert';

export const fetchAlerts = async (): Promise<Alert[]> => {
  // In a real app, this would fetch from /api/alerts
  // For now, we return an empty array as a baseline.
  return Promise.resolve([]);
};
