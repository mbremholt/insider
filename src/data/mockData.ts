import { Transaction } from '@/types';

export const mockData: Transaction[] = [
  {
    insiderName: "Erik Andersson",
    companyName: "Volvo AB",
    ticker: "VOLV-B.ST",
    position: "CEO",
    type: "Buy",
    volume: 50000,
    date: "2024-01-15",
    priceChange: 2.45
  },
  {
    insiderName: "Maria Nilsson",
    companyName: "Ericsson",
    ticker: "ERIC-B.ST",
    position: "Board Member",
    type: "Sell",
    volume: 25000,
    date: "2024-01-14",
    priceChange: -1.23
  },
  {
    insiderName: "Johan Svensson",
    companyName: "Atlas Copco",
    ticker: "ATCO-A.ST",
    position: "CFO",
    type: "Buy",
    volume: 15000,
    date: "2024-01-13",
    priceChange: 1.78
  },
  {
    insiderName: "Anna Lindberg",
    companyName: "H&M",
    ticker: "HM-B.ST",
    position: "Board Member",
    type: "Sell",
    volume: 30000,
    date: "2024-01-12",
    priceChange: -0.89
  }
];