import { PortfolioMetrics } from '../types/portfolio';

const API_BASE_URL = 'http://localhost:5001/api/portfolio';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

export const fetchPortfolioMetrics = async (): Promise<PortfolioMetrics> => {
  const response = await fetch(API_BASE_URL, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch portfolio metrics');
  }
  const data = await response.json();
  return data.data;
};
