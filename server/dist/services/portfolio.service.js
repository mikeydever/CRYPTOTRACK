"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateAveragePrice = calculateAveragePrice;
exports.calculateProfitLoss = calculateProfitLoss;
exports.calculatePortfolioMetrics = calculatePortfolioMetrics;
function calculateAveragePrice(transactions) {
    const buys = transactions.filter(t => t.type === 'buy');
    const totalQuantity = buys.reduce((sum, t) => sum + t.quantity, 0);
    const totalCost = buys.reduce((sum, t) => sum + (t.quantity * t.pricePerCoin + (t.fee || 0)), 0);
    return totalQuantity > 0 ? totalCost / totalQuantity : 0;
}
function calculateProfitLoss(transactions, currentPrice) {
    const totalBuyValue = transactions
        .filter(t => t.type === 'buy')
        .reduce((sum, t) => sum + (t.quantity * t.pricePerCoin + (t.fee || 0)), 0);
    const totalSellValue = transactions
        .filter(t => t.type === 'sell')
        .reduce((sum, t) => sum + (t.quantity * t.pricePerCoin - (t.fee || 0)), 0);
    const currentHoldingsQuantity = transactions.reduce((sum, t) => {
        if (t.type === 'buy')
            return sum + t.quantity;
        if (t.type === 'sell')
            return sum - t.quantity;
        return sum;
    }, 0);
    const currentHoldingsValue = currentHoldingsQuantity * currentPrice;
    return (currentHoldingsValue + totalSellValue) - totalBuyValue;
}
function calculatePortfolioMetrics(transactions, currentPrices) {
    const holdings = {};
    // Sort transactions by timestamp to process them in order
    const sortedTransactions = [...transactions].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    sortedTransactions.forEach(t => {
        if (!holdings[t.coinId]) {
            holdings[t.coinId] = {
                quantity: 0,
                totalCost: 0,
                averagePrice: 0,
                currentPrice: 0,
                value: 0,
                profitLoss: 0, // This will be unrealized P/L
                profitLossPercent: 0,
                realizedProfitLoss: 0,
            };
        }
        const holding = holdings[t.coinId];
        const avgPriceBeforeTx = holding.quantity > 0 ? holding.totalCost / holding.quantity : 0;
        if (t.type === 'buy') {
            holding.quantity += t.quantity;
            holding.totalCost += (t.quantity * t.pricePerCoin + (t.fee || 0));
        }
        else if (t.type === 'sell') {
            const costOfSoldAssets = avgPriceBeforeTx * t.quantity;
            const proceedsFromSale = t.quantity * t.pricePerCoin - (t.fee || 0);
            holding.realizedProfitLoss += (proceedsFromSale - costOfSoldAssets);
            holding.totalCost -= costOfSoldAssets;
            holding.quantity -= t.quantity;
        }
    });
    let totalPortfolioValue = 0;
    let totalPortfolioProfitLoss = 0;
    let totalInitialCost = 0;
    for (const coinId in holdings) {
        const holding = holdings[coinId];
        holding.averagePrice = holding.quantity > 0 ? holding.totalCost / holding.quantity : 0;
        holding.currentPrice = currentPrices[coinId] || 0;
        holding.value = holding.quantity * holding.currentPrice;
        const unrealizedProfitLoss = holding.value - holding.totalCost;
        holding.profitLoss = unrealizedProfitLoss; // Unrealized P/L for the current holding
        holding.profitLossPercent = holding.totalCost > 0 ? (unrealizedProfitLoss / holding.totalCost) * 100 : 0;
        totalPortfolioValue += holding.value;
        totalPortfolioProfitLoss += (holding.realizedProfitLoss + unrealizedProfitLoss);
        totalInitialCost += holding.totalCost;
    }
    const totalPortfolioCost = sortedTransactions
        .filter(t => t.type === 'buy')
        .reduce((acc, t) => acc + (t.quantity * t.pricePerCoin + (t.fee || 0)), 0);
    return {
        holdings: Object.keys(holdings).map(coinId => ({ ...holdings[coinId], coinId })),
        totalValue: totalPortfolioValue,
        totalProfitLoss: totalPortfolioProfitLoss,
        totalProfitLossPercent: totalPortfolioCost > 0 ? (totalPortfolioProfitLoss / totalPortfolioCost) * 100 : 0,
    };
}
