export interface Transaction {
  id?: string;
  coinId: string;
  type: 'buy' | 'sell';
  quantity: number;
  pricePerCoin: number;
  timestamp: string;
  fee?: number;
  notes?: string;
}
