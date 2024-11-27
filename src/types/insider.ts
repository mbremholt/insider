export interface InsiderTransaction {
  publishDate: string;
  issuer: string;
  insider: string;
  position: string;
  related: boolean;
  type: 'Förvärv' | 'Avyttring'; // Buy/Sell
  instrumentName: string;
  instrumentType: string;
  isin: string;
  transactionDate: string;
  volume: number;
  volumeUnit: string;
  price: number;
  currency: string;
  details?: string;
} 