import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export function SearchBar({ onSearch }: SearchBarProps) {
  return (
    <div className="relative w-full max-w-md">
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-muted-foreground" />
      </div>
      <Input
        type="search"
        placeholder="Search transactions..."
        className="pl-10 bg-background/50 border-primary/20 hover:border-primary/40 focus:border-primary transition-colors"
        onChange={(e) => onSearch(e.target.value)}
      />
    </div>
  );
}