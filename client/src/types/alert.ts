export interface Alert {
  id?: string;
  coinId: string;
  targetPrice: number;
  direction: 'above' | 'below';
  triggered?: boolean;
}
