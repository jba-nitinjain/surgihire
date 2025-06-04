import React from 'react';
import { Search } from 'lucide-react';

interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SearchBox: React.FC<SearchBoxProps> = ({ 
  value, 
  onChange, 
  placeholder = 'Search customers...' 
}) => {
  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-brand-blue" />
      </div>
      <input
        type="text"
        className="block w-full pl-10 pr-3 py-2 border border-light-gray-200 rounded-md leading-5 
                  bg-white placeholder-dark-text/50 text-dark-text
                  focus:outline-none focus:ring-2 focus:ring-brand-blue 
                  focus:border-brand-blue transition duration-150 ease-in-out sm:text-sm"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default SearchBox;