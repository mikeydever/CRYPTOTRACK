export interface Transaction {
  id?: string;
  coinId: string;
  coinSymbol: string; // Added this line
  type: 'buy' | 'sell';
  quantity: number;
  pricePerCoin: number;
  timestamp: string;
  fee?: number;
  notes?: string;
}
