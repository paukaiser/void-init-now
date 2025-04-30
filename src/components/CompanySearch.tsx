
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Input } from "../components/ui/input.tsx";
import { Label } from "../components/ui/label.tsx";
import { Search, Plus } from 'lucide-react';
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog.tsx";
import { Button } from "../components/ui/button.tsx";

export interface Company {
  id: string;
  name: string;
  address: string;
  dealId?: string | null;
}

interface CompanySearchProps {
  onSelect: (company: Company) => void;
  value?: Company | null;
  required?: boolean;
}

function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<F>): Promise<ReturnType<F>> => {
    return new Promise((resolve) => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => resolve(func(...args)), waitFor);
    });
  };
}

const CompanySearch: React.FC<CompanySearchProps> = ({ onSelect, value, required = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Company[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNoDealDialog, setShowNoDealDialog] = useState(false);
  const [selectedCompanyForDialog, setSelectedCompanyForDialog] = useState<Company | null>(null);
  const onSelectRef = useRef(onSelect);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  const searchCompanies = async (term: string) => {
    if (!term || term.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setShowResults(true);
    setError(null);

    try {
      const res = await fetch(`http://localhost:3000/api/companies/search?q=${encodeURIComponent(term)}`, {
        credentials: 'include'
      });

      if (!res.ok) {
        throw new Error('Search failed');
      }

      const data = await res.json();
      setSearchResults(data.results);
    } catch (err) {
      console.error('❌ Company search failed:', err);
      toast.error("Company search failed");
      setError("Search error");
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useCallback(debounce(searchCompanies, 300), []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    debouncedSearch(term);
  };

  const handleSelectCompany = async (company: Company) => {
    setSearchTerm(company.name);
    setShowResults(false);
    setSearchResults([]);
    setError(null);

    try {
      const res = await fetch(`http://localhost:3000/api/hubspot/company/${company.id}/deals`, {
        credentials: 'include'
      });

      if (!res.ok) {
        throw new Error("Failed to fetch deals");
      }

      const deals = await res.json();
      const firstDeal = deals[0];

      if (!firstDeal) {
        // No deals found, show dialog
        setSelectedCompanyForDialog(company);
        setShowNoDealDialog(true);
      } else {
        // Pass company with dealId
        onSelectRef.current({ ...company, dealId: firstDeal.id || null });
      }
    } catch (err) {
      console.error("❌ Failed to fetch deal:", err);
      toast.error("Could not fetch deal for selected company.");
      onSelectRef.current({ ...company, dealId: null });
    }
  };

  const handleCreateDeal = async () => {
    if (!selectedCompanyForDialog) return;

    try {
      const payload = {
        dealName: `${selectedCompanyForDialog.name} - New Deal`,
        pipeline: "default", // ✅ internal pipeline ID
        stage: "appointmentscheduled", // ✅ internal stage ID, not "Meeting Scheduled"
        companyId: selectedCompanyForDialog.id
      };


      const res = await fetch('http://localhost:3000/api/hubspot/deals/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error("Failed to create deal");
      }

      const newDeal = await res.json();
      toast.success("New deal created successfully");

      // Close dialog and select company with new deal ID
      setShowNoDealDialog(false);
      onSelectRef.current({
        ...selectedCompanyForDialog,
        dealId: newDeal.id
      });
    } catch (err) {
      console.error("❌ Failed to create deal:", err);
      toast.error("Could not create new deal");
      // Still select the company but without a deal
      setShowNoDealDialog(false);
      onSelectRef.current({ ...selectedCompanyForDialog, dealId: null });
    }
  };

  const handleAddNewCompany = () => {
    // This function was referenced but not implemented in the original code
    // Will implement placeholder functionality
    toast.info("Adding new company feature not implemented yet");
  };

  useEffect(() => {
    if (value) {
      setSearchTerm(value.name);
      setSearchResults([]);
      setShowResults(false);
    }
  }, [value]);

  return (
    <div className="space-y-2 relative">
      <Label htmlFor="company-search">Company Name {required && <span className="text-red-500">*</span>}</Label>
      <div className="relative">
        <Input
          id="company-search"
          placeholder="Search companies..."
          value={searchTerm}
          onChange={handleInputChange}
          className="pl-9"
          onFocus={() => {
            if (searchTerm.trim().length >= 2 && searchResults.length > 0) {
              setShowResults(true);
            }
          }}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
          required={required}
          autoComplete="off"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>

      {showResults && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {loading && <div className="p-4 text-center text-sm text-gray-500">Searching...</div>}
          {!loading && error && <div className="p-4 text-center text-sm text-red-500">{error}</div>}
          {!loading && !error && searchResults.length > 0 && (
            <div>
              {searchResults.map((company) => (
                <div
                  key={company.id}
                  className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                  onMouseDown={() => handleSelectCompany(company)}
                >
                  <div className="font-medium">{company.name}</div>
                  <div className="text-sm text-gray-500">{company.address}</div>
                </div>
              ))}
            </div>
          )}
          {!loading && !error && searchResults.length === 0 && searchTerm.trim().length >= 2 && (
            <div>
              <div className="p-4 text-center text-sm text-gray-500">No matching companies found</div>
              <div
                className="p-3 hover:bg-gray-100 cursor-pointer border-t border-gray-100 flex items-center text-blue-600"
                onMouseDown={handleAddNewCompany}
              >
                <Plus size={16} className="mr-2" />
                <span>Add "{searchTerm}" as new company</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* No Deal Dialog */}
      <Dialog open={showNoDealDialog} onOpenChange={setShowNoDealDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>No Deal Found</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-500 mb-4">
              No deal was found for {selectedCompanyForDialog?.name}.
              Would you like to create a new deal with the following details?
            </p>
            <div className="space-y-2 text-sm border-l-2 border-gray-200 pl-3">
              <p><span className="font-medium">Deal Name:</span> {selectedCompanyForDialog?.name} - New Deal</p>
              <p><span className="font-medium">Pipeline:</span> Sales Pipeline</p>
              <p><span className="font-medium">Stage:</span> Meeting Scheduled</p>
              <p><span className="font-medium">Association:</span> {selectedCompanyForDialog?.name}</p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowNoDealDialog(false);
                if (selectedCompanyForDialog) {
                  onSelectRef.current({ ...selectedCompanyForDialog, dealId: null });
                }
              }}
            >
              Skip
            </Button>
            <Button onClick={handleCreateDeal}>
              Create Deal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompanySearch;
