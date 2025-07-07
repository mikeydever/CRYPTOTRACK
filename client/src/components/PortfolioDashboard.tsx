import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchPortfolioMetrics } from '../services/portfolio.service';
import { PortfolioMetrics } from '../types/portfolio';

export function PortfolioDashboard() {
  const { data, isLoading, error } = useQuery<PortfolioMetrics, Error>({
    queryKey: ['portfolioMetrics'],
    queryFn: fetchPortfolioMetrics,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  if (isLoading) return <div data-testid="loading">Loading portfolio...</div>;
  if (error) return <div data-testid="error">Error: {error.message}</div>;

  return (
    <div data-testid="portfolio-dashboard" className="p-4">
      <h1 className="text-2xl font-bold mb-4">Portfolio Overview</h1>
      <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold text-white mb-2">Total Portfolio Value:</h2>
        <p className="text-4xl font-bold text-green-400">${data?.totalValue.toFixed(2)}</p>
        <div className={`text-lg ${data && data.totalProfitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {data && data.totalProfitLoss >= 0 ? '+' : ''}{data?.totalProfitLoss.toFixed(2)} ({data?.totalProfitLossPercent.toFixed(2)}%)
        </div>
      </div>

      <h2 className="text-xl font-semibold text-white mb-4">Your Holdings</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-700 rounded-lg shadow-md">
          <thead>
            <tr className="bg-gray-600 text-white uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-left">Coin</th>
              <th className="py-3 px-6 text-left">Quantity</th>
              <th className="py-3 px-6 text-left">Avg. Price</th>
              <th className="py-3 px-6 text-left">Current Price</th>
              <th className="py-3 px-6 text-left">Value</th>
              <th className="py-3 px-6 text-left">P&L</th>
              <th className="py-3 px-6 text-left">P&L %</th>
            </tr>
          </thead>
          <tbody className="text-gray-200 text-sm font-light">
            {data?.holdings.map((holding) => (
              <tr key={holding.coinId} className="border-b border-gray-600 hover:bg-gray-600">
                <td className="py-3 px-6 text-left whitespace-nowrap">{holding.coinId.toUpperCase()}</td>
                <td className="py-3 px-6 text-left">{holding.quantity.toFixed(4)}</td>
                <td className="py-3 px-6 text-left">${holding.averagePrice.toFixed(2)}</td>
                <td className="py-3 px-6 text-left">${holding.currentPrice.toFixed(2)}</td>
                <td className="py-3 px-6 text-left">${holding.value.toFixed(2)}</td>
                <td className={`py-3 px-6 text-left ${holding.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {holding.profitLoss >= 0 ? '+' : ''}{holding.profitLoss.toFixed(2)}
                </td>
                <td className={`py-3 px-6 text-left ${holding.profitLossPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {holding.profitLossPercent >= 0 ? '+' : ''}{holding.profitLossPercent.toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}