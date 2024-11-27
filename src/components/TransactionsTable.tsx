import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { type TableProps } from '@/types';
import { Sparkline } from '@/components/ui/sparkline';
import { cn } from '@/lib/utils';

export function TransactionsTable({ data, onSort, sortColumn, sortDirection }: TableProps) {
  const mockSparklineData = [1, 2, 1.5, 3, 2, 4, 3.5, 2, 3, 4];

  return (
    <div className="w-full overflow-auto rounded-lg border border-primary/20">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead 
              className="cursor-pointer hover:text-primary"
              onClick={() => onSort('insiderName')}
            >
              Insider Name
              {sortColumn === 'insiderName' && (
                sortDirection === 'asc' ? <ArrowUp className="inline ml-1 h-4 w-4" /> : 
                <ArrowDown className="inline ml-1 h-4 w-4" />
              )}
            </TableHead>
            <TableHead>Company Name</TableHead>
            <TableHead>Ticker</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Volume</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Price Change</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((transaction, index) => (
            <TableRow 
              key={`${transaction.insiderName}-${index}`}
              className="hover:bg-primary/5 transition-colors"
            >
              <TableCell className="font-medium">{transaction.insiderName}</TableCell>
              <TableCell>{transaction.companyName}</TableCell>
              <TableCell>{transaction.ticker}</TableCell>
              <TableCell>{transaction.position}</TableCell>
              <TableCell>
                <span className={cn(
                  "px-2 py-1 rounded-full text-xs font-semibold",
                  transaction.type === 'Buy' ? "bg-green-500/20 text-green-500" : 
                  "bg-red-500/20 text-red-500"
                )}>
                  {transaction.type}
                </span>
              </TableCell>
              <TableCell className="text-right font-mono">
                {transaction.volume.toLocaleString()}
              </TableCell>
              <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <span className={cn(
                    "font-mono",
                    transaction.priceChange > 0 ? "text-green-500" : "text-red-500"
                  )}>
                    {transaction.priceChange > 0 ? '+' : ''}{transaction.priceChange.toFixed(2)}%
                  </span>
                  <Sparkline data={mockSparklineData} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}