
import React from 'react';
import { Building2, Plus } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { Company } from '@/types/company';

interface CompanySearchResultsProps {
  loading: boolean;
  apiError: string | null;
  searchResults: Company[];
  searchTerm: string;
  handleSelectCompany: (company: Company) => void;
  handleAddNewCompany: () => void;
  isApiKeyMissing: boolean;
}

const CompanySearchResults: React.FC<CompanySearchResultsProps> = ({
  loading,
  apiError,
  searchResults,
  searchTerm,
  handleSelectCompany,
  handleAddNewCompany,
  isApiKeyMissing
}) => {
  if (loading) {
    return (
      <div className="p-4 space-y-3">
        <div className="flex items-center space-x-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[150px]" />
            <Skeleton className="h-3 w-[200px]" />
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[170px]" />
            <Skeleton className="h-3 w-[220px]" />
          </div>
        </div>
      </div>
    );
  }
  
  if (apiError) {
    return (
      <div className="p-4 text-center">
        <p className="text-sm text-red-500 mb-2">{apiError}</p>
        <div 
          className="p-3 hover:bg-gray-100 cursor-pointer border-t border-gray-100 flex items-center text-blue-600"
          onClick={handleAddNewCompany}
        >
          <Plus size={16} className="mr-2" />
          <span>Create "{searchTerm}" as new company</span>
        </div>
      </div>
    );
  }
  
  if (searchResults.length > 0) {
    return (
      <div>
        {searchResults.map((company) => (
          <div 
            key={company.id}
            className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
            onClick={() => handleSelectCompany(company)}
          >
            <div className="flex items-start">
              <Building2 className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
              <div>
                <div className="font-medium">{company.name}</div>
                <div className="text-sm text-gray-500">{company.address}</div>
                {company.owner && (
                  <div className="text-sm text-gray-500 mt-1">Owner: {company.owner}</div>
                )}
              </div>
            </div>
          </div>
        ))}
        <div 
          className="p-3 hover:bg-blue-50 cursor-pointer flex items-center text-blue-600 border-t border-gray-100"
          onClick={handleAddNewCompany}
        >
          <Plus size={16} className="mr-2" />
          <span>Create "{searchTerm}" as new company</span>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="p-4 text-center text-sm text-gray-500">No companies found</div>
      {searchTerm && searchTerm.length >= 2 && (
        <div 
          className="p-3 hover:bg-blue-50 cursor-pointer flex items-center text-blue-600 border-t border-gray-100"
          onClick={handleAddNewCompany}
        >
          <Plus size={16} className="mr-2" />
          <span>Create "{searchTerm}" as new company</span>
        </div>
      )}
    </div>
  );
};

export default CompanySearchResults;
