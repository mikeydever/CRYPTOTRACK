export interface Holding {
  coinId: string;
  coinSymbol: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  value: number;
  profitLoss: number;
  profitLossPercent: number;
  realizedProfitLoss: number;
}

export interface PortfolioMetrics {
  holdings: Holding[];
  totalValue: number;
  totalProfitLoss: number;
  totalProfitLossPercent: number;
}