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
    test('calculates overall portfolio metrics correctly', () => {
      const transactions = [
        { coinId: 'bitcoin', type: 'buy', quantity: 1, pricePerCoin: 40000, fee: 0 },
        { coinId: 'bitcoin', type: 'sell', quantity: 0.5, pricePerCoin: 45000, fee: 0 },
        { coinId: 'ethereum', type: 'buy', quantity: 5, pricePerCoin: 2000, fee: 0 },
      ];
      const currentPrices = {
        bitcoin: 48000,
        ethereum: 2500,
      };

      const metrics = calculatePortfolioMetrics(transactions as any, currentPrices);

      expect(metrics.totalValue).toBeCloseTo(1 * 48000 + 5 * 2500 - 0.5 * 48000, 2); // 48000 + 12500 - 24000 = 36500
      expect(metrics.totalProfitLoss).toBeCloseTo(6500, 2);
      expect(metrics.holdings).toHaveLength(2);

      const bitcoinHolding = metrics.holdings.find(h => h.coinId === 'bitcoin');
      expect(bitcoinHolding?.quantity).toBe(0.5);
      expect(bitcoinHolding?.averagePrice).toBeCloseTo(40000, 2);
      expect(bitcoinHolding?.currentPrice).toBe(48000);
      expect(bitcoinHolding?.value).toBeCloseTo(0.5 * 48000, 2);
      expect(bitcoinHolding?.profitLoss).toBeCloseTo(0.5 * 48000 - 0.5 * 40000, 2);

      const ethereumHolding = metrics.holdings.find(h => h.coinId === 'ethereum');
      expect(ethereumHolding?.quantity).toBe(5);
      expect(ethereumHolding?.averagePrice).toBeCloseTo(2000, 2);
      expect(ethereumHolding?.currentPrice).toBe(2500);
      expect(ethereumHolding?.value).toBeCloseTo(5 * 2500, 2);
      expect(ethereumHolding?.profitLoss).toBeCloseTo(5 * 2500 - 5 * 2000, 2);
    });

    test('handles empty transactions array', () => {
      const transactions: any[] = [];
      const currentPrices = { bitcoin: 100 };
      const metrics = calculatePortfolioMetrics(transactions, currentPrices);

      expect(metrics.totalValue).toBe(0);
      expect(metrics.totalProfitLoss).toBe(0);
      expect(metrics.holdings).toHaveLength(0);
    });

    test('handles sell transactions that reduce quantity to zero or below', () => {
      const transactions = [
        { coinId: 'bitcoin', type: 'buy', quantity: 1, pricePerCoin: 100, fee: 0 },
        { coinId: 'bitcoin', type: 'sell', quantity: 1, pricePerCoin: 150, fee: 0 },
      ];
      const currentPrices = { bitcoin: 120 };
      const metrics = calculatePortfolioMetrics(transactions as any, currentPrices);

      expect(metrics.holdings).toHaveLength(1);
      const bitcoinHolding = metrics.holdings.find(h => h.coinId === 'bitcoin');
      expect(bitcoinHolding?.quantity).toBe(0);
      expect(bitcoinHolding?.totalCost).toBe(0);
      expect(bitcoinHolding?.averagePrice).toBe(0);
    });
  });
});
