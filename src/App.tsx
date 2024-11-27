import { Header } from '@/components/Header';
import { Filters } from '@/components/Filters';
import { TransactionsTable } from '@/components/TransactionsTable';
import { useTransactions } from '@/hooks/useTransactions';

export default function App() {
  const {
    data,
    sortColumn,
    sortDirection,
    handleSort,
    handleSearch,
    handleFilter
  } = useTransactions();

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Header onSearch={handleSearch} />
        <Filters onFilterChange={handleFilter} />
        <TransactionsTable 
          data={data}
          onSort={handleSort}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
        />
      </div>
    </div>
  );
}