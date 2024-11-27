export interface InsiderTransaction {
  publishDate: string;
  issuer: string;
  insider: string;
  position: string;
  related: boolean;
  type: 'Förvärv' | 'Avyttring';
  instrumentName: string;
  instrumentType: string;
  isin: string;
  transactionDate: string;
  volume: number;
  volumeUnit: string;
  price: number;
  currency: string;
  details?: string;
  currentPrice?: number;
  priceChange?: number;
  symbol?: string;
} 