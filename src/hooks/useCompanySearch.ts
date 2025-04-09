
import { useState, useEffect } from 'react';
import { toast } from "sonner";
import { searchHubspotCompanies, createHubspotCompany, HubspotCompany } from '@/utils/hubspotApi';
import { Company } from '@/types/company';

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

interface UseCompanySearchProps {
  initialValue?: Company | null;
  onSelect: (company: Company) => void;
}

const useCompanySearch = ({ initialValue, onSelect }: UseCompanySearchProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Company[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isApiKeyMissing, setIsApiKeyMissing] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(initialValue || null);
  
  useEffect(() => {
    if (initialValue) {
      setSearchTerm(initialValue.name);
      setSelectedCompany(initialValue);
    }
  }, [initialValue]);
  
  const searchCompanies = async (term: string) => {
    if (!term || term.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    
    setLoading(true);
    setApiError(null);
    setIsApiKeyMissing(false);
    setShowResults(true);
    
    try {
      // Call the HubSpot API to search for companies
      const hubspotCompanies = await searchHubspotCompanies(term);
      
      // Convert HubSpot companies to our format
      const companies = hubspotCompanies.map(convertHubspotCompany);
      setSearchResults(companies);
    } catch (error: any) {
      console.error("Error searching companies:", error);
      
      if (error.message && error.message.includes("API key not configured")) {
        setIsApiKeyMissing(true);
        setApiError("HubSpot API key is not configured. Please update the API key in src/utils/hubspotApi.ts");
        toast.error("HubSpot API key not configured");
      } else {
        setApiError("Failed to search companies. Please check your network connection and try again.");
        toast.error("Failed to search companies");
      }
      
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
    setSelectedCompany(company);
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
      
      setSelectedCompany(newCompany);
      onSelect(newCompany);
      setShowResults(false);
      toast.success(`Company "${searchTerm}" created successfully`);
    } catch (error: any) {
      console.error("Error creating company:", error);
      
      if (error.message && error.message.includes("API key not configured")) {
        setIsApiKeyMissing(true);
        toast.error("HubSpot API key is not configured");
      } else {
        toast.warning("Created company locally. API connection failed.");
      }
      
      // Fallback to local company object if API fails
      const newCompany: Company = {
        id: `new-${Date.now()}`,
        name: searchTerm,
        address: 'Please update address'
      };
      
      setSelectedCompany(newCompany);
      onSelect(newCompany);
      setShowResults(false);
    } finally {
      setLoading(false);
    }
  };
  
  return {
    searchTerm,
    searchResults,
    showResults,
    loading,
    apiError,
    isApiKeyMissing,
    selectedCompany,
    setShowResults,
    handleInputChange,
    handleSelectCompany,
    handleAddNewCompany,
  };
};

export default useCompanySearch;
