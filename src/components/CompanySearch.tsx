import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Plus } from 'lucide-react';
import { toast } from "sonner";

// Updated interface to better match potential HubSpot properties
export interface Company {
  id: string; // HubSpot hs_object_id
  name: string; // HubSpot name property
  address: string; // HubSpot address property (or specific components like street, city, state, zip)
  // owner?: string; // HubSpot owner ID might be an ID, not a name directly
}

interface CompanySearchProps {
  onSelect: (company: Company) => void;
  value?: Company | null;
  required?: boolean;
}

// Simple debounce function helper
function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<F>): Promise<ReturnType<F>> => {
    return new Promise((resolve) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        timeoutId = null; // Clear the timeout ID after execution
        resolve(func(...args));
      }, waitFor);
    });
  };
}

const CompanySearch: React.FC<CompanySearchProps> = ({ onSelect, value, required = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Company[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // Add error state

  // Store the latest onSelect callback in a ref to avoid issues with debounce closures
  const onSelectRef = useRef(onSelect);
  useEffect(() => {
      onSelectRef.current = onSelect;
  }, [onSelect]);

  // Function to perform the HubSpot search
  const searchHubspotCompanies = async (term: string) => {
    if (!term || term.trim().length < 2) { // Minimum search term length (e.g., 2 chars)
      setSearchResults([]);
      setShowResults(false);
      setLoading(false);
      setError(null);
      return;
    }

    console.log(`Searching HubSpot for: "${term}"`);
    setLoading(true);
    setShowResults(true); // Show dropdown while loading/searching
    setError(null);

    const accessToken = import.meta.env.VITE_HUBSPOT_PRIVATE_APP_TOKEN;
    const hubspotSearchUrl = '/crm/v3/objects/companies/search';

    if (!accessToken) {
      console.error("HubSpot access token is missing.");
      toast.error("HubSpot access token is missing.");
      setError("Configuration error.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(hubspotSearchUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          filterGroups: [
            {
              filters: [
                {
                  propertyName: 'name',
                  operator: 'CONTAINS_TOKEN', // Use CONTAINS_TOKEN for partial matches, or STARTS_WITH / EQ
                  value: term
                }
                // You could add more filters here (e.g., search domain too)
              ]
            }
          ],
          properties: ['name', 'address', 'city', 'state', 'zip'], // Request needed properties
          limit: 20 // Limit the number of results shown
          // Add 'after' here if implementing pagination for search results
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("HubSpot Search API Error:", errorData);
        throw new Error(`HubSpot API search failed with status ${response.status}`);
      }

      const data = await response.json();
      console.log("HubSpot Search API Response:", data);

      const companies: Company[] = data.results.map((company: any) => ({
        id: company.id,
        name: company.properties.name || 'Unnamed Company',
        address: `${company.properties.address || ''} ${company.properties.city || ''} ${company.properties.state || ''} ${company.properties.zip || ''}`.trim() || 'No address provided',
      }));

      setSearchResults(companies);
      // Handle pagination for search results if 'data.paging.next.link' exists - omitted for simplicity initially

    } catch (err: any) {
      console.error("Error searching companies:", err);
      toast.error("Failed to search companies");
      setError("Search failed.");
      setSearchResults([]); // Clear results on error
    } finally {
      setLoading(false);
    }
  };

  // Create a debounced version of the search function
  // Using useCallback to ensure the debounced function isn't recreated on every render
  const debouncedSearch = useCallback(debounce(searchHubspotCompanies, 300), []); // 300ms debounce

  // Update search term state when input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    // Call the debounced search function
    debouncedSearch(term);
  };

  // Handle selecting a company from the results
  const handleSelectCompany = (company: Company) => {
    setSearchTerm(company.name); // Update input field
    setShowResults(false);
    setSearchResults([]); // Clear results after selection
    setError(null);
    onSelectRef.current(company); // Call the original onSelect passed via props using ref
  };

  // Handle adding a new company (local only currently)
  const handleAddNewCompany = () => {
    // This still needs HubSpot API integration to actually create the company
    const newCompany: Company = {
      id: `new-${Date.now()}`,
      name: searchTerm,
      address: 'Please update address'
    };
    setSearchTerm(newCompany.name);
    setShowResults(false);
    setSearchResults([]);
    setError(null);
    onSelectRef.current(newCompany);
    toast.info("Locally added company. HubSpot integration needed.");
  };

  // Effect to update search term if the external value prop changes
  useEffect(() => {
    if (value) {
      setSearchTerm(value.name);
      setSearchResults([]); // Clear search results when value is set externally
      setShowResults(false);
    } else {
      // Optional: Clear search term if value is removed externally
      // setSearchTerm('');
    }
  }, [value]);

  return (
    <div className="space-y-2 relative">
      <Label htmlFor="company-search">Company Name {required && <span className="text-red-500">*</span>}</Label>
      <div className="relative">
        <Input
          id="company-search" // Changed id slightly to avoid potential conflicts if Label 'for' was targeting old one
          placeholder="Search HubSpot companies..."
          value={searchTerm}
          onChange={handleInputChange}
          className="pl-9"
          // No longer need onFocus to trigger loading
          onFocus={() => {
              // Show results immediately if there are any already from previous search
              if(searchTerm.trim().length >= 2 && searchResults.length > 0) {
                  setShowResults(true);
              }
          }}
          onBlur={() => {
            // Delay hiding results to allow click/selection
            setTimeout(() => setShowResults(false), 200);
          }}
          required={required}
          autoComplete="off" // Prevent browser autocomplete interference
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>

      {/* Results Dropdown */}
      {showResults && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {loading && (
            <div className="p-4 text-center text-sm text-gray-500">Searching...</div>
          )}
          {!loading && error && (
             <div className="p-4 text-center text-sm text-red-500">{error}</div>
          )}
          {!loading && !error && searchResults.length > 0 && (
            <div>
              {searchResults.map((company) => (
                <div
                  key={company.id}
                  className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                  onMouseDown={() => handleSelectCompany(company)} // Use onMouseDown
                >
                  <div className="font-medium">{company.name}</div>
                  <div className="text-sm text-gray-500">{company.address}</div>
                </div>
              ))}
            </div>
          )}
          {/* Show "No results" only after loading is complete, there's no error, and the array is empty */}
          {!loading && !error && searchResults.length === 0 && searchTerm.trim().length >= 2 && (
            <div>
                <div className="p-4 text-center text-sm text-gray-500">No matching companies found</div>
                {/* Option to add new company */}
                <div
                    className="p-3 hover:bg-gray-100 cursor-pointer border-t border-gray-100 flex items-center text-blue-600"
                    onMouseDown={handleAddNewCompany} // Use onMouseDown
                >
                    <Plus size={16} className="mr-2" />
                    <span>Add "{searchTerm}" as new company</span>
                </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CompanySearch;
