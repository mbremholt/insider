import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FiltersProps {
  onFilterChange: (type: string, value: string) => void;
}

export function Filters({ onFilterChange }: FiltersProps) {
  return (
    <div className="flex flex-wrap gap-4">
      <Select onValueChange={(value) => onFilterChange('type', value)}>
        <SelectTrigger className="w-[180px] bg-background/50">
          <SelectValue placeholder="Transaction Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="buy">Buy</SelectItem>
          <SelectItem value="sell">Sell</SelectItem>
        </SelectContent>
      </Select>

      <Select onValueChange={(value) => onFilterChange('date', value)}>
        <SelectTrigger className="w-[180px] bg-background/50">
          <SelectValue placeholder="Date Range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="7d">Last 7 Days</SelectItem>
          <SelectItem value="30d">Last 30 Days</SelectItem>
          <SelectItem value="90d">Last 90 Days</SelectItem>
          <SelectItem value="all">All Time</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}