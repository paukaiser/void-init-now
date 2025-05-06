import React, { useState, useRef, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CompanySearchProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (company: { name: string; address: string }) => void;
  existingCompanyValue?: string;
  placeholder?: string;
}

const CompanySearch: React.FC<CompanySearchProps> = ({ 
  value, 
  onChange, 
  onSelect,
  existingCompanyValue,
  placeholder = "Search for a company..."
}) => {
  const [selectedCompany, setSelectedCompany] = useState<{ name: string; address: string } | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (existingCompanyValue) {
      onChange(existingCompanyValue);
    }
  }, [existingCompanyValue, onChange]);

  const handlePlaceSelect = () => {
    if (!searchInputRef.current) return;
    
    // Fix TypeScript error by checking if google exists and using type assertion
    if (typeof window !== 'undefined' && window.google) {
      const places = new (window as any).google.maps.places.Autocomplete(searchInputRef.current);
      places.addListener('place_changed', () => {
        const place = places.getPlace();
        const name = place.name;
        setSelectedCompany({
          name,
          address: place.formatted_address || ""
        });
        if (onSelect) onSelect({
          name,
          address: place.formatted_address || ""
        });
      });
    }
  };

  useEffect(() => {
    handlePlaceSelect();
  }, []);

  return (
    <div>
      <Label htmlFor="company">Company</Label>
      <Input
        type="text"
        id="company"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        ref={searchInputRef}
      />
    </div>
  );
};

export default CompanySearch;
