
import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

// Este componente ya no se usará directamente, pero lo mantenemos para compatibilidad
const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, onSearchChange }) => {
  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
      <Input
        type="text"
        placeholder="Buscar aplicaciones..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10 pr-8 py-2 w-full bg-gray-100 border-none"
        aria-label="Buscar aplicaciones"
      />
      {searchTerm && (
        <button
          onClick={() => onSearchChange('')}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 p-1"
          aria-label="Borrar búsqueda"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
