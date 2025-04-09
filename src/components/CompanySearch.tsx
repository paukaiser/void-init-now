
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Plus, Building2 } from 'lucide-react';
import { toast } from "sonner";
import { searchHubspotCompanies, createHubspotCompany, HubspotCompany } from '@/utils/hubspotApi';
import { Skeleton } from '@/components/ui/skeleton';

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
  const [apiError, setApiError] = useState<string | null>(null);
  
  // Convert from HubSpot format to our Company interface
  const convertHubspotCompany = (hubspotCompany: HubspotCompany): Company => {
    const { properties } = hubspotCompany;
    
    // Construct address from various HubSpot address components
    let fullAddress = properties.address || '';
    if (properties.city) {
      fullAddress += fullAddress ? `, ${properties.city}` : properties.city;
    }
    if (properties.zip) {
      fullAddress += fullAddress ? `, ${properties.zip}` : properties.zip;
    }
    if (properties.country) {
      fullAddress += fullAddress ? `, ${properties.country}` : properties.country;
    }
    
    return {
      id: hubspotCompany.id,
      name: properties.name,
      address: fullAddress || 'No address provided',
      // Add other properties as needed
    };
  };
  
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
    setApiError(null);
    setShowResults(true);
    
    try {
      // Call the HubSpot API to search for companies
      const hubspotCompanies = await searchHubspotCompanies(term);
      
      // Convert HubSpot companies to our format
      const companies = hubspotCompanies.map(convertHubspotCompany);
      setSearchResults(companies);
    } catch (error) {
      console.error("Error searching companies:", error);
      setApiError("Failed to search companies. Please check your API key and try again.");
      toast.error("Failed to search companies");
      // Fallback to empty results
      setSearchResults([]);
    } finally {
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
  
  const handleAddNewCompany = async () => {
    if (!searchTerm.trim()) {
      toast.error("Please enter a company name");
      return;
    }
    
    setLoading(true);
    try {
      // Create a new company in HubSpot
      const hubspotCompany = await createHubspotCompany({
        name: searchTerm,
      });
      
      // Convert the response to our format
      const newCompany = convertHubspotCompany(hubspotCompany);
      
      onSelect(newCompany);
      setShowResults(false);
      toast.success(`Company "${searchTerm}" created successfully`);
    } catch (error) {
      console.error("Error creating company:", error);
      
      // Fallback to local company object if API fails
      const newCompany: Company = {
        id: `new-${Date.now()}`,
        name: searchTerm,
        address: 'Please update address'
      };
      
      onSelect(newCompany);
      setShowResults(false);
      toast.warning("Created company locally. API connection failed.");
    } finally {
      setLoading(false);
    }
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
            // Delayed hide to allow clicks on results
            setTimeout(() => setShowResults(false), 200);
          }}
          required={required}
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>
      
      {showResults && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {loading ? (
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
          ) : apiError ? (
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
          ) : searchResults.length > 0 ? (
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
          ) : (
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
          )}
        </div>
      )}
    </div>
  );
};

export default CompanySearch;
