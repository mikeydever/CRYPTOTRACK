import { calculateAveragePrice, calculateProfitLoss, calculatePortfolioMetrics } from '../services/portfolio.service';

describe('Portfolio Service', () => {
  describe('calculateAveragePrice', () => {
    test('calculates correct average price with fees', () => {
      const transactions = [
        { type: 'buy', quantity: 1, pricePerCoin: 40000, fee: 20 },
        { type: 'buy', quantity: 0.5, pricePerCoin: 50000, fee: 10 },
        { type: 'sell', quantity: 0.5, pricePerCoin: 45000, fee: 10 } // Should be ignored
      ];

      const avgPrice = calculateAveragePrice(transactions as any);
      // (1*40000 + 20 + 0.5*50000 + 10) / 1.5 = 43,353.33
      expect(avgPrice).toBeCloseTo(43353.33, 2);
    });

    test('returns 0 for no buy transactions', () => {
      const transactions = [
        { type: 'sell', quantity: 1, pricePerCoin: 40000, fee: 20 }
      ];
      expect(calculateAveragePrice(transactions as any)).toBe(0);
    });
  });

  describe('calculateProfitLoss', () => {
    test('calculates correct profit/loss for a single coin', () => {
      const transactions = [
        { type: 'buy', quantity: 1, pricePerCoin: 100, fee: 0 },
        { type: 'sell', quantity: 0.5, pricePerCoin: 150, fee: 0 },
      ];
      const currentPrice = 120;
      const profitLoss = calculateProfitLoss(transactions as any, currentPrice);
      // (0.5 * 120) + (0.5 * 150) - (1 * 100) = 60 + 75 - 100 = 35
      expect(profitLoss).toBeCloseTo(35, 2);
    });

    test('returns 0 for no transactions', () => {
      const transactions: any[] = [];
      const currentPrice = 100;
      const profitLoss = calculateProfitLoss(transactions, currentPrice);
      expect(profitLoss).toBe(0);
    });
  });

  describe('calculatePortfolioMetrics', () => {
    test('calculates metrics for a single buy', () => {
      const transactions = [
        { coinId: 'bitcoin', type: 'buy', quantity: 1, pricePerCoin: 40000, fee: 20, timestamp: new Date() },
      ];
      const currentPrices = { bitcoin: 45000 };
      const metrics = calculatePortfolioMetrics(transactions as any, currentPrices);

      expect(metrics.totalValue).toBe(45000);
      expect(metrics.totalProfitLoss).toBe(4980);
      expect(metrics.totalProfitLossPercent).toBeCloseTo(12.44, 2);

      const bitcoin = metrics.holdings[0];
      expect(bitcoin.quantity).toBe(1);
      expect(bitcoin.averagePrice).toBe(40020);
      expect(bitcoin.totalCost).toBe(40020);
      expect(bitcoin.value).toBe(45000);
      expect(bitcoin.profitLoss).toBe(4980); // Unrealized P/L
      expect(bitcoin.realizedProfitLoss).toBe(0);
    });

    test('calculates metrics for multiple buys', () => {
      const transactions = [
        { coinId: 'bitcoin', type: 'buy', quantity: 1, pricePerCoin: 40000, fee: 20, timestamp: new Date('2023-01-01') },
        { coinId: 'bitcoin', type: 'buy', quantity: 0.5, pricePerCoin: 50000, fee: 10, timestamp: new Date('2023-01-02') },
      ];
      const currentPrices = { bitcoin: 48000 };
      const metrics = calculatePortfolioMetrics(transactions as any, currentPrices);

      expect(metrics.totalValue).toBe(72000);
      expect(metrics.totalProfitLoss).toBe(6970);
      expect(metrics.totalProfitLossPercent).toBeCloseTo(10.72, 2);

      const bitcoin = metrics.holdings[0];
      expect(bitcoin.quantity).toBe(1.5);
      expect(bitcoin.averagePrice).toBeCloseTo(43353.33, 2);
      expect(bitcoin.totalCost).toBe(65030);
      expect(bitcoin.value).toBe(72000);
      expect(bitcoin.profitLoss).toBe(6970);
      expect(bitcoin.realizedProfitLoss).toBe(0);
    });

    test('calculates metrics after a sell', () => {
      const transactions = [
        { coinId: 'bitcoin', type: 'buy', quantity: 1, pricePerCoin: 40000, fee: 20, timestamp: new Date('2023-01-01') },
        { coinId: 'bitcoin', type: 'buy', quantity: 0.5, pricePerCoin: 50000, fee: 10, timestamp: new Date('2023-01-02') },
        { coinId: 'bitcoin', type: 'sell', quantity: 0.8, pricePerCoin: 60000, fee: 15, timestamp: new Date('2023-01-03') },
      ];
      const currentPrices = { bitcoin: 55000 };
      const metrics = calculatePortfolioMetrics(transactions as any, currentPrices);

      // Initial cost: (1 * 40000 + 20) + (0.5 * 50000 + 10) = 40020 + 25010 = 65030
      // Avg cost per coin: 65030 / 1.5 = 43353.33
      // Cost of sold assets: 0.8 * 43353.33 = 34682.66
      // Proceeds from sale: 0.8 * 60000 - 15 = 47985
      // Realized P/L: 47985 - 34682.66 = 13302.34
      // Remaining quantity: 1.5 - 0.8 = 0.7
      // Remaining cost: 65030 - 34682.66 = 30347.34
      // Current value of holdings: 0.7 * 55000 = 38500
      // Unrealized P/L: 38500 - 30347.34 = 8152.66
      // Total P/L: 13302.33 + 8152.67 = 21455
      expect(metrics.totalValue).toBe(38500);
      expect(metrics.totalProfitLoss).toBeCloseTo(21455, 2);

      const bitcoin = metrics.holdings[0];
      expect(bitcoin.quantity).toBe(0.7);
      expect(bitcoin.averagePrice).toBeCloseTo(43353.33, 2);
      expect(bitcoin.totalCost).toBeCloseTo(30347.33, 2);
      expect(bitcoin.value).toBe(38500);
      expect(bitcoin.profitLoss).toBeCloseTo(8152.67, 2); // Unrealized P/L
      expect(bitcoin.realizedProfitLoss).toBeCloseTo(13302.33, 2);
    });

    test('handles selling all assets of a coin', () => {
      const transactions = [
        { coinId: 'bitcoin', type: 'buy', quantity: 1, pricePerCoin: 40000, fee: 0, timestamp: new Date('2023-01-01') },
        { coinId: 'bitcoin', type: 'sell', quantity: 1, pricePerCoin: 45000, fee: 0, timestamp: new Date('2023-01-02') },
      ];
      const currentPrices = { bitcoin: 48000 };
      const metrics = calculatePortfolioMetrics(transactions as any, currentPrices);

      expect(metrics.totalValue).toBe(0);
      expect(metrics.totalProfitLoss).toBe(5000);

      const bitcoin = metrics.holdings[0];
      expect(bitcoin.quantity).toBe(0);
      expect(bitcoin.totalCost).toBe(0);
      expect(bitcoin.value).toBe(0);
      expect(bitcoin.profitLoss).toBe(0);
      expect(bitcoin.realizedProfitLoss).toBe(5000);
    });

    test('calculates metrics for multiple coins', () => {
      const transactions = [
        { coinId: 'bitcoin', type: 'buy', quantity: 1, pricePerCoin: 40000, fee: 0, timestamp: new Date('2023-01-01') },
        { coinId: 'ethereum', type: 'buy', quantity: 10, pricePerCoin: 2000, fee: 0, timestamp: new Date('2023-01-01') },
      ];
      const currentPrices = { bitcoin: 42000, ethereum: 2500 };
      const metrics = calculatePortfolioMetrics(transactions as any, currentPrices);

      expect(metrics.totalValue).toBe(67000);
      expect(metrics.totalProfitLoss).toBe(7000);

      const bitcoin = metrics.holdings.find(h => h.coinId === 'bitcoin');
      expect(bitcoin?.profitLoss).toBe(2000);

      const ethereum = metrics.holdings.find(h => h.coinId === 'ethereum');
      expect(ethereum?.profitLoss).toBe(5000);
    });

    test('handles empty transactions array', () => {
      const metrics = calculatePortfolioMetrics([], {});
      expect(metrics.totalValue).toBe(0);
      expect(metrics.totalProfitLoss).toBe(0);
      expect(metrics.holdings).toEqual([]);
    });
  });
});
