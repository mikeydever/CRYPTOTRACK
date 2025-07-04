import { Transaction } from '@prisma/client';

export function calculateAveragePrice(transactions: Transaction[]): number {
  const buys = transactions.filter(t => t.type === 'buy');
  const totalQuantity = buys.reduce((sum, t) => sum + t.quantity, 0);
  const totalCost = buys.reduce((sum, t) => sum + (t.quantity * t.pricePerCoin + (t.fee || 0)), 0);
  return totalQuantity > 0 ? totalCost / totalQuantity : 0;
}

export function calculateProfitLoss(transactions: Transaction[], currentPrice: number): number {
  const totalBuyValue = transactions
    .filter(t => t.type === 'buy')
    .reduce((sum, t) => sum + (t.quantity * t.pricePerCoin + (t.fee || 0)), 0);

  const totalSellValue = transactions
    .filter(t => t.type === 'sell')
    .reduce((sum, t) => sum + (t.quantity * t.pricePerCoin - (t.fee || 0)), 0);

  const currentHoldingsQuantity = transactions.reduce((sum, t) => {
    if (t.type === 'buy') return sum + t.quantity;
    if (t.type === 'sell') return sum - t.quantity;
    return sum;
  }, 0);

  const currentHoldingsValue = currentHoldingsQuantity * currentPrice;

  return (currentHoldingsValue + totalSellValue) - totalBuyValue;
}

export function calculatePortfolioMetrics(transactions: Transaction[], currentPrices: { [coinId: string]: number }) {
  const holdings: { [coinId: string]: { quantity: number; totalCost: number; averagePrice: number; currentPrice: number; value: number; profitLoss: number; profitLossPercent: number } } = {};

  transactions.forEach(t => {
    if (!holdings[t.coinId]) {
      holdings[t.coinId] = {
        quantity: 0,
        totalCost: 0,
        averagePrice: 0,
        currentPrice: 0,
        value: 0,
        profitLoss: 0,
        profitLossPercent: 0,
      };
    }

    if (t.type === 'buy') {
      holdings[t.coinId].quantity += t.quantity;
      holdings[t.coinId].totalCost += (t.quantity * t.pricePerCoin + (t.fee || 0));
    } else if (t.type === 'sell') {
      // Calculate cost of sold quantity based on current average price before updating quantity
      const costOfSoldQuantity = t.quantity * holdings[t.coinId].averagePrice;
      holdings[t.coinId].quantity -= t.quantity;
      holdings[t.coinId].totalCost -= costOfSoldQuantity;

      // If quantity becomes zero or negative, reset cost basis
      if (holdings[t.coinId].quantity <= 0) {
        holdings[t.coinId].totalCost = 0;
        holdings[t.coinId].averagePrice = 0;
      }
    }

    // Recalculate average price after each transaction for accurate cost basis
    if (holdings[t.coinId].quantity > 0) {
      holdings[t.coinId].averagePrice = holdings[t.coinId].totalCost / holdings[t.coinId].quantity;
    } else {
      holdings[t.coinId].averagePrice = 0;
    }
  });

  let totalPortfolioValue = 0;
  let totalPortfolioProfitLoss = 0;
  let totalPortfolioCost = 0;

  for (const coinId in holdings) {
    const holding = holdings[coinId];
    holding.currentPrice = currentPrices[coinId] || 0;
    holding.value = holding.quantity * holding.currentPrice;
    holding.profitLoss = holding.value - holding.totalCost;
    holding.profitLossPercent = holding.totalCost > 0 ? (holding.profitLoss / holding.totalCost) * 100 : 0;

    totalPortfolioValue += holding.value;
    totalPortfolioProfitLoss += holding.profitLoss;
    totalPortfolioCost += holding.totalCost;
  }

  return {
    holdings: Object.keys(holdings).map(coinId => ({ ...holdings[coinId], coinId })),
    totalValue: totalPortfolioValue,
    totalProfitLoss: totalPortfolioProfitLoss,
    totalProfitLossPercent: totalPortfolioCost > 0 ? (totalPortfolioProfitLoss / totalPortfolioCost) * 100 : 0,
  };
}
