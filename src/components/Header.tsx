import { SearchBar } from './SearchBar';

interface HeaderProps {
  onSearch: (query: string) => void;
  searchQuery: string;
}

export function Header({ onSearch, searchQuery }: HeaderProps) {
  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
      <h1 className="text-2xl font-bold">Swedish Insider Transactions</h1>
      <SearchBar onSearch={onSearch} value={searchQuery} />
    </div>
  );
}