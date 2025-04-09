
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, AlertCircle } from 'lucide-react';
import { Company } from '@/types/company';
import CompanySearchResults from './CompanySearchResults';
import useCompanySearch from '@/hooks/useCompanySearch';

interface CompanySearchProps {
  onSelect: (company: Company) => void;
  value?: Company | null;
  required?: boolean;
}

const CompanySearch: React.FC<CompanySearchProps> = ({ 
  onSelect, 
  value, 
  required = false 
}) => {
  const {
    searchTerm,
    searchResults,
    showResults,
    loading,
    apiError,
    isApiKeyMissing,
    setShowResults,
    handleInputChange,
    handleSelectCompany,
    handleAddNewCompany,
  } = useCompanySearch({ 
    initialValue: value,
    onSelect
  });
  
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
            // Delayed hide to allow clicks on results
            setTimeout(() => setShowResults(false), 200);
          }}
          required={required}
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>
      
      {isApiKeyMissing && (
        <div className="text-sm text-red-500 flex items-center mt-1">
          <AlertCircle className="h-4 w-4 mr-1" />
          <span>Please replace the token placeholder in src/utils/hubspotApi.ts</span>
        </div>
      )}
      
      {showResults && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          <CompanySearchResults
            loading={loading}
            apiError={apiError}
            searchResults={searchResults}
            searchTerm={searchTerm}
            handleSelectCompany={handleSelectCompany}
            handleAddNewCompany={handleAddNewCompany}
            isApiKeyMissing={isApiKeyMissing}
          />
        </div>
      )}
    </div>
  );
};

export default CompanySearch;
