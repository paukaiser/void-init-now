
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from "./ui/input";

interface CompanySearchProps {
  onSelect: (company: any) => void;
  value: any;
  required?: boolean;
}

const CompanySearch: React.FC<CompanySearchProps> = ({ onSelect, value, required = false }) => {
  // This is a placeholder component that would be implemented with actual company search functionality
  return (
    <div className="relative w-full">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
      <Input
        type="text"
        placeholder="Search companies..."
        className="pl-9 w-full"
        value={value?.name || ''}
        onChange={(e) => {
          // In a real implementation, this would trigger a search
          console.log("Searching for:", e.target.value);
        }}
        required={required}
      />
    </div>
  );
};

export default CompanySearch;
