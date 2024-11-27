import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { InsiderTransaction } from '@/types/insider';
import { fetchInsiderTransactions } from '@/services/insiderService';

export function TransactionsTable() {
  const [data, setData] = useState<InsiderTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortColumn, setSortColumn] = useState<keyof InsiderTransaction>('publishDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const transactions = await fetchInsiderTransactions();
      setData(transactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleSort = (column: keyof InsiderTransaction) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];
    const direction = sortDirection === 'asc' ? 1 : -1;
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return direction * aValue.localeCompare(bValue);
    }
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return direction * (aValue - bValue);
    }
    return 0;
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full overflow-auto rounded-lg border border-primary/20">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead 
              className="cursor-pointer hover:text-primary"
              onClick={() => handleSort('insider')}
            >
              Insider Name
              {sortColumn === 'insider' && (
                sortDirection === 'asc' ? <ArrowUp className="inline ml-1 h-4 w-4" /> : 
                <ArrowDown className="inline ml-1 h-4 w-4" />
              )}
            </TableHead>
            <TableHead>Company Name</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Volume</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((transaction, index) => (
            <TableRow 
              key={`${transaction.insider}-${index}`}
              className="hover:bg-primary/5 transition-colors"
            >
              <TableCell className="font-medium">{transaction.insider}</TableCell>
              <TableCell>{transaction.issuer}</TableCell>
              <TableCell>{transaction.position}</TableCell>
              <TableCell>
                <span className={cn(
                  "px-2 py-1 rounded-full text-xs font-semibold",
                  transaction.type === 'Förvärv' ? "bg-green-500/20 text-green-500" : 
                  "bg-red-500/20 text-red-500"
                )}>
                  {transaction.type}
                </span>
              </TableCell>
              <TableCell className="text-right font-mono">
                {transaction.volume.toLocaleString()} {transaction.volumeUnit}
              </TableCell>
              <TableCell className="text-right font-mono">
                {transaction.price.toLocaleString()} {transaction.currency}
              </TableCell>
              <TableCell>{new Date(transaction.transactionDate).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}