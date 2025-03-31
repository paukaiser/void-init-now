
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Plus } from 'lucide-react';
import { toast } from "sonner";

export interface Company {
  id: string;
  name: string;
  address: string;
  owner?: string;
}

interface CompanySearchProps {
  onSelect: (company: Company) => void;
  value?: Company | null;
  required?: boolean;
}

const CompanySearch: React.FC<CompanySearchProps> = ({ onSelect, value, required = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Company[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (value) {
      setSearchTerm(value.name);
    }
  }, [value]);
  
  const searchCompanies = async (term: string) => {
    if (!term || term.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    
    setLoading(true);
    setShowResults(true);
    
    try {
      // In a real app, this would call the Google Places API
      // For now, we'll simulate the API call with mock data
      setTimeout(() => {
        const mockResults: Company[] = [
          { 
            id: '1', 
            name: 'Acme Inc', 
            address: '123 Main St, San Francisco, CA 94105',
            owner: 'John Smith'
          },
          { 
            id: '2', 
            name: 'Global Tech', 
            address: '456 Market St, San Francisco, CA 94103',
            owner: 'Sarah Johnson'
          },
          { 
            id: '3', 
            name: 'Innovate Solutions', 
            address: '789 Howard St, San Francisco, CA 94103',
            owner: 'David Chen'
          }
        ].filter(company => 
          company.name.toLowerCase().includes(term.toLowerCase())
        );
        
        setSearchResults(mockResults);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error("Error searching companies:", error);
      toast.error("Failed to search companies");
      setLoading(false);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    searchCompanies(term);
  };
  
  const handleSelectCompany = (company: Company) => {
    onSelect(company);
    setSearchTerm(company.name);
    setShowResults(false);
  };
  
  const handleAddNewCompany = () => {
    // Create a new company with the entered name
    const newCompany: Company = {
      id: `new-${Date.now()}`, // Generate a temporary ID
      name: searchTerm,
      address: 'Please update address'
    };
    
    onSelect(newCompany);
    setShowResults(false);
    toast.success("New company created. Please update the address.");
  };
  
  return (
    <div className="space-y-2 relative">
      <Label htmlFor="company">Company Name {required && <span className="text-red-500">*</span>}</Label>
      <div className="relative">
        <Input 
          id="company" 
          placeholder="Search for a company..." 
          value={searchTerm}
          onChange={handleInputChange}
          className="pl-9"
          onFocus={() => searchTerm && searchTerm.length >= 2 && setShowResults(true)}
          onBlur={() => {
            setTimeout(() => setShowResults(false), 200);
          }}
          required={required}
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>
      
      {showResults && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {loading ? (
            <div className="p-4 text-center text-sm text-gray-500">Loading...</div>
          ) : searchResults.length > 0 ? (
            <div>
              {searchResults.map((company) => (
                <div 
                  key={company.id}
                  className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                  onClick={() => handleSelectCompany(company)}
                >
                  <div className="font-medium">{company.name}</div>
                  <div className="text-sm text-gray-500">{company.address}</div>
                  {company.owner && (
                    <div className="text-sm text-gray-500 mt-1">Owner: {company.owner}</div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div>
              <div className="p-4 text-center text-sm text-gray-500">No companies found</div>
              {searchTerm && searchTerm.length >= 2 && (
                <div 
                  className="p-3 hover:bg-gray-100 cursor-pointer border-t border-gray-100 flex items-center text-blue-600"
                  onClick={handleAddNewCompany}
                >
                  <Plus size={16} className="mr-2" />
                  <span>Add "{searchTerm}" as new company</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CompanySearch;
