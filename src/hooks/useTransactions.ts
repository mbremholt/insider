import { useState } from 'react';
import { Transaction } from '@/types';
import { mockData } from '@/data/mockData';

export function useTransactions() {
  const [data, setData] = useState<Transaction[]>(mockData);
  const [sortColumn, setSortColumn] = useState<keyof Transaction>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (column: keyof Transaction) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleSearch = (query: string) => {
    const filtered = mockData.filter(transaction => 
      Object.values(transaction).some(value => 
        value.toString().toLowerCase().includes(query.toLowerCase())
      )
    );
    setData(filtered);
  };

  const handleFilter = (type: string, value: string) => {
    let filtered = [...mockData];
    
    if (type === 'type' && value !== 'all') {
      filtered = filtered.filter(t => 
        t.type.toLowerCase() === value.toLowerCase()
      );
    }
    
    if (type === 'date') {
      const now = new Date();
      const days = value === '7d' ? 7 : value === '30d' ? 30 : value === '90d' ? 90 : 0;
      
      if (days > 0) {
        const cutoff = new Date(now.setDate(now.getDate() - days));
        filtered = filtered.filter(t => new Date(t.date) >= cutoff);
      }
    }
    
    setData(filtered);
  };

  return {
    data,
    sortColumn,
    sortDirection,
    handleSort,
    handleSearch,
    handleFilter
  };
}