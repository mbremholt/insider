export interface Transaction {
  insiderName: string;
  companyName: string;
  ticker: string;
  position: string;
  type: 'Buy' | 'Sell';
  volume: number;
  date: string;
  priceChange: number;
}

export interface TableProps {
  data: Transaction[];
  onSort: (column: keyof Transaction) => void;
  sortColumn: keyof Transaction;
  sortDirection: 'asc' | 'desc';
}