
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, Plus, Building } from 'lucide-react';
import { toast } from "sonner";

export interface Company {
  id: string;
  name: string;
  address: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  salesRegion?: string;
  cuisine?: string;
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
  const [showAddDialog, setShowAddDialog] = useState(false);
  
  // Form state for adding new company
  const [newCompany, setNewCompany] = useState<Omit<Company, 'id' | 'address'>>({
    name: '',
    streetAddress: '',
    city: '',
    state: '',
    postalCode: '',
    salesRegion: '',
    cuisine: ''
  });
  
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
      // In a real app, this would be an API call to Hubspot
      // For now, we'll simulate a response
      setTimeout(() => {
        const mockResults: Company[] = [
          { 
            id: '1', 
            name: 'Acme Inc', 
            address: '123 Main St, San Francisco, CA 94105',
            streetAddress: '123 Main St',
            city: 'San Francisco',
            state: 'CA',
            postalCode: '94105',
            salesRegion: 'West',
            cuisine: 'American'
          },
          { 
            id: '2', 
            name: 'Global Tech', 
            address: '456 Market St, San Francisco, CA 94103',
            streetAddress: '456 Market St',
            city: 'San Francisco',
            state: 'CA',
            postalCode: '94103',
            salesRegion: 'West',
            cuisine: 'Tech Cafeteria'
          },
          { 
            id: '3', 
            name: 'Innovate Solutions', 
            address: '789 Howard St, San Francisco, CA 94103',
            streetAddress: '789 Howard St',
            city: 'San Francisco',
            state: 'CA',
            postalCode: '94103',
            salesRegion: 'West',
            cuisine: 'Fusion'
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
  
  const handleAddCompany = () => {
    setShowAddDialog(true);
    setShowResults(false);
  };
  
  const handleNewCompanyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewCompany(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmitNewCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!newCompany.name || !newCompany.city || !newCompany.state) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    try {
      // In a real app, this would be an API call to Hubspot
      // For now, we'll simulate a response
      
      // Create the full address from the parts
      const address = [
        newCompany.streetAddress,
        newCompany.city,
        newCompany.state,
        newCompany.postalCode
      ].filter(Boolean).join(', ');
      
      const createdCompany: Company = {
        id: `new-${Date.now()}`,
        name: newCompany.name,
        address,
        ...newCompany
      };
      
      // Select the newly created company
      onSelect(createdCompany);
      setSearchTerm(createdCompany.name);
      
      // Reset the form and close the dialog
      setNewCompany({
        name: '',
        streetAddress: '',
        city: '',
        state: '',
        postalCode: '',
        salesRegion: '',
        cuisine: ''
      });
      setShowAddDialog(false);
      
      toast.success("Company added successfully");
    } catch (error) {
      console.error("Error adding company:", error);
      toast.error("Failed to add company");
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
            // Delay hiding results to allow for selection
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
                </div>
              ))}
              <div 
                className="p-3 hover:bg-blue-50 cursor-pointer flex items-center text-blue-600"
                onClick={handleAddCompany}
              >
                <Plus size={16} className="mr-2" />
                <span>Add a new company</span>
              </div>
            </div>
          ) : (
            <div>
              <div className="p-4 text-center text-sm text-gray-500">No companies found</div>
              <div 
                className="p-3 hover:bg-blue-50 cursor-pointer flex items-center text-blue-600 border-t border-gray-100"
                onClick={handleAddCompany}
              >
                <Plus size={16} className="mr-2" />
                <span>Add a new company</span>
              </div>
            </div>
          )}
        </div>
      )}
      
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Building className="mr-2 h-5 w-5" />
              Add New Company
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmitNewCompany} className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-company-name">Company Name <span className="text-red-500">*</span></Label>
                <Input 
                  id="new-company-name"
                  name="name"
                  value={newCompany.name}
                  onChange={handleNewCompanyChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="new-company-street">Street Address</Label>
                <Input 
                  id="new-company-street"
                  name="streetAddress"
                  value={newCompany.streetAddress}
                  onChange={handleNewCompanyChange}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-company-city">City <span className="text-red-500">*</span></Label>
                  <Input 
                    id="new-company-city"
                    name="city"
                    value={newCompany.city}
                    onChange={handleNewCompanyChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="new-company-state">State <span className="text-red-500">*</span></Label>
                  <Input 
                    id="new-company-state"
                    name="state"
                    value={newCompany.state}
                    onChange={handleNewCompanyChange}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="new-company-postal">Postal Code</Label>
                <Input 
                  id="new-company-postal"
                  name="postalCode"
                  value={newCompany.postalCode}
                  onChange={handleNewCompanyChange}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-company-region">Sales Region</Label>
                  <Input 
                    id="new-company-region"
                    name="salesRegion"
                    value={newCompany.salesRegion}
                    onChange={handleNewCompanyChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="new-company-cuisine">Cuisine</Label>
                  <Input 
                    id="new-company-cuisine"
                    name="cuisine"
                    value={newCompany.cuisine}
                    onChange={handleNewCompanyChange}
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Add Company
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompanySearch;
