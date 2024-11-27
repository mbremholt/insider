import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { InsiderTransaction } from '@/types/insider';
import { fetchInsiderTransactions } from '@/services/insiderService';

export function TransactionsTable() {
  const [transactions, setTransactions] = useState<InsiderTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await fetchInsiderTransactions();
        console.log('Fetched transactions:', data); // Debug log
        setTransactions(data);
      } catch (err) {
        console.error('Error loading transactions:', err);
        setError(err instanceof Error ? err.message : 'Failed to load transactions');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return <div className="flex justify-center p-4">Loading transactions...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>;
  }

  if (!transactions.length) {
    return <div className="p-4">No transactions found</div>;
  }

  return (
    <div className="w-full overflow-auto rounded-lg border border-primary/20">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Insider</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Volume</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Current Price</TableHead>
            <TableHead className="text-right">Change %</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction, index) => (
            <TableRow key={index}>
              <TableCell>{transaction.publishDate}</TableCell>
              <TableCell>{transaction.issuer}</TableCell>
              <TableCell>{transaction.insider}</TableCell>
              <TableCell>
                <span className={cn(
                  "px-2 py-1 rounded-full text-xs font-semibold",
                  transaction.type === 'Förvärv' 
                    ? "bg-green-500/20 text-green-500" 
                    : "bg-red-500/20 text-red-500"
                )}>
                  {transaction.type}
                </span>
              </TableCell>
              <TableCell className="text-right">
                {transaction.volume.toLocaleString()} {transaction.volumeUnit}
              </TableCell>
              <TableCell className="text-right">
                {transaction.price.toLocaleString()} {transaction.currency}
              </TableCell>
              <TableCell className="text-right">
                {transaction.currentPrice?.toLocaleString() ?? '-'}
              </TableCell>
              <TableCell className="text-right">
                {transaction.priceChange 
                  ? `${transaction.priceChange.toFixed(2)}%` 
                  : '-'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}