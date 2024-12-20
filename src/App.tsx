import { Header } from '@/components/Header';
import { Filters } from '@/components/Filters';
import { TransactionsTable } from '@/components/TransactionsTable';
import { useTransactions } from '@/hooks/useTransactions';
import { useState } from 'react';

export default function App() {
  const {
    data,
    sortColumn,
    sortDirection,
    handleSort,
    handleSearch,
    handleFilter
  } = useTransactions();

  const [searchQuery, setSearchQuery] = useState<string>('');

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Header onSearch={setSearchQuery} searchQuery={searchQuery} />
        <Filters onFilterChange={handleFilter} />
        <TransactionsTable searchQuery={searchQuery} />
      </div>
    </div>
  );
}