
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Calendar, FileText, CalendarIcon } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { cn } from '../lib/utils.ts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog.tsx";
import { Button } from "../components/ui/button.tsx";
import { Label } from "../components/ui/label.tsx";
import { Input } from "../components/ui/input.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select.tsx";
import { toast } from "sonner";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover.tsx";
import { Calendar as CalendarComponent } from "../components/ui/calendar.tsx";
import { Textarea } from "../components/ui/textarea.tsx";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group.tsx";
import CompanySearch, { Company } from '../components/CompanySearch.tsx';
import { useMeetingContext } from '../context/MeetingContext.tsx';
import { useUser } from '../hooks/useUser.ts';

interface CompanyWithDeal extends Company {
  dealId?: string | null | undefined;
}

interface FloatingActionButtonProps {
  onCreateTask?: () => void;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onCreateTask }) => {
  const { id } = useParams<{ id: string }>();
  const [isOpen, setIsOpen] = useState(false);
  const [isCreateMeetingDialogOpen, setIsCreateMeetingDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<CompanyWithDeal | null>(null);
  const [taskNotes, setTaskNotes] = useState("");
  const [taskDate, setTaskDate] = useState<Date | undefined>(undefined);
  const [meetingType, setMeetingType] = useState<"Sales Meeting" | "Sales Followup">("Sales Meeting");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState("");
  const [notes, setNotes] = useState("");
  const [showAddCompanyDialog, setShowAddCompanyDialog] = useState(false);
  const [newCompany, setNewCompany] = useState({
    name: '',
    street: '',
    city: '',
    postalCode: '',
    state: '',
    cuisine: '',
    fullAddress: ''
  });
  const [cuisineOptions, setCuisineOptions] = useState([
    "American", "Italian", "Mexican", "Asian", "Mediterranean", 
    "Indian", "French", "Greek", "Spanish", "Japanese", 
    "Chinese", "Thai", "Vietnamese", "Korean", "Middle Eastern",
    "Brazilian", "Caribbean", "African", "Fusion", "Other"
  ]);
  const fabRef = useRef<HTMLDivElement>(null);
  const googleSearchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { meetings } = useMeetingContext();
  const meetingDetails = meetings.find(m => m.id === id);
  const user = useUser();
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Initialize Google Places Autocomplete
  useEffect(() => {
    const initializeGooglePlaces = () => {
      // Check if the script already exists to avoid duplicates
      if (document.querySelector('script[src*="maps.googleapis.com/maps/api"]')) {
        return initializeAutocomplete();
      }
      
      // Create and append the Google Places API script
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initializeAutocomplete;
      document.body.appendChild(script);
    };

    // If the dialog is open, initialize Google Places
    if (showAddCompanyDialog) {
      initializeGooglePlaces();
    }

    // Clean up
    return () => {
      // No cleanup needed for the script since we're checking for its existence
    };
  }, [showAddCompanyDialog]);

  const initializeAutocomplete = () => {
    if (!googleSearchInputRef.current || !window.google?.maps?.places) return;

    const autocomplete = new window.google.maps.places.Autocomplete(googleSearchInputRef.current, {
      types: ['establishment'],
      fields: ['name', 'formatted_address', 'address_components', 'geometry']
    });
    
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (!place.geometry) {
        console.log("No details available for this place");
        return;
      }

      let restaurantName = place.name || '';
      let street = '';
      let city = '';
      let postalCode = '';
      let state = '';

      // Extract address components
      if (place.address_components) {
        place.address_components.forEach((component) => {
          const types = component.types;

          if (types.includes('street_number')) {
            street += component.long_name + ' ';
          }
          if (types.includes('route')) {
            street += component.long_name;
          }
          if (types.includes('locality')) {
            city = component.long_name;
          }
          if (types.includes('postal_code')) {
            postalCode = component.long_name;
          }
          if (types.includes('administrative_area_level_1')) {
            state = component.long_name;
          }
        });
      }

      // Update the form fields
      setNewCompany(prev => ({
        ...prev,
        name: restaurantName,
        street: street.trim(),
        city,
        postalCode,
        state,
        fullAddress: place.formatted_address || ''
      }));
      
      console.log("Place selected:", place);
    });
  };

  const handleCreateMeeting = () => {
    setIsCreateMeetingDialogOpen(true);
  };

  const handleSubmitMeeting = async () => {
    if (!selectedCompany || !date || !startTime) {
      toast.error("Please fill in all required fields");
      return;
    }

    const meetingDate = new Date(date);
    const [hour, minute] = startTime.split(":").map(Number);
    meetingDate.setHours(hour, minute, 0, 0);
    const endDate = new Date(meetingDate);
    endDate.setHours(endDate.getHours() + 1);

    const payload = {
      title: meetingType,
      companyId: selectedCompany.id,
      dealId: selectedCompany.dealId || null,
      meetingType,
      startTime: meetingDate.getTime(),
      endTime: endDate.getTime(),
      notes,
    };

    try {
      const res = await fetch(`${BASE_URL}/api/meetings/create`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to create meeting');

      const newMeeting = await res.json();
      console.log("✅ API Response:", newMeeting);

      if (!newMeeting?.meetingId) {
        console.error("❌ Invalid Meeting Response:", newMeeting);
        throw new Error('Failed to retrieve new meeting ID');
      }

      toast.success(`Meeting scheduled successfully`);

      // ✅ Use the isPastMeeting flag here
      if (newMeeting.isPastMeeting) {
        toast.success("Past meeting logged. Redirecting to outcome.");
        navigate(`/meeting/${newMeeting.meetingId}/outcome`);
        return;
      }

      // Reset form state only after successful creation
      setIsCreateMeetingDialogOpen(false);
      setSelectedCompany(null);
      setMeetingType("Sales Meeting");
      setDate(undefined);
      setStartTime("");
      setNotes("");
    } catch (err) {
      console.error("❌ Error creating meeting:", err);
      toast.error("Failed to schedule meeting");
    }
  };


  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 7; hour < 21; hour++) {
      for (let minute of [0, 30]) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        options.push(<option key={time} value={time}>{time}</option>);
      }
    }
    return options;
  };

  const handleStartTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = (e.target as HTMLSelectElement).value;
    setStartTime(value);
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = (e.target as HTMLTextAreaElement).value;
    setNotes(value);
  };

  // New company form handlers
  const handleNewCompanyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target as HTMLInputElement;
    setNewCompany(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCuisineChange = (value: string) => {
    setNewCompany(prev => ({
      ...prev,
      cuisine: value
    }));
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!newCompany.name || !newCompany.street || !newCompany.city || !newCompany.postalCode) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      // Create company
      const companyPayload = {
        name: newCompany.name,
        street: newCompany.street,
        city: newCompany.city,
        postalCode: newCompany.postalCode,
        state: newCompany.state || 'N/A',
        cuisine: newCompany.cuisine,
      };

      const companyRes = await fetch(`${BASE_URL}/api/companies/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(companyPayload)
      });

      if (!companyRes.ok) {
        throw new Error("Failed to create company");
      }

      const company = await companyRes.json();
      
      // Close dialog and update selected company
      setShowAddCompanyDialog(false);
      setSelectedCompany({
        id: company.id,
        name: company.name,
        address: `${company.street}, ${company.city}, ${company.postalCode}`
      });
      
      toast.success("Company created successfully");
      
    } catch (err) {
      console.error("❌ Failed to create company:", err);
      toast.error("Could not create company");
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (fabRef.current && !fabRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/30 z-30" aria-hidden="true" />}

      <div ref={fabRef} className="fixed bottom-6 right-6 z-40">
        <div className="flex flex-col items-end space-y-4">
          <div className="flex items-center">
            {isOpen && (
              <span className="mr-2 bg-white/80 backdrop-blur-sm px-2 py-1 rounded text-[#2E1813] text-sm shadow-sm">Meeting</span>
            )}
            <button className="bg-black hover:bg-black/90 text-[#FF8769] rounded-full shadow-lg w-14 h-14 flex items-center justify-center" onClick={handleCreateMeeting}>
              {isOpen ? <Calendar size={24} /> : <Plus size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Meeting Dialog */}
      <Dialog open={isCreateMeetingDialogOpen} onOpenChange={setIsCreateMeetingDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule New Meeting</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <CompanySearch 
                onSelect={setSelectedCompany} 
                value={selectedCompany} 
                required 
                onAddNewCompany={() => setShowAddCompanyDialog(true)}
              />
            </div>

            <div className="space-y-2">
              <Label>Meeting Type <span className="text-red-500">*</span></Label>
              <RadioGroup
                value={meetingType}
                onValueChange={(value) => setMeetingType(value as "Sales Meeting" | "Sales Followup")}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Sales Meeting" id="meeting-type-sales" />
                  <Label htmlFor="meeting-type-sales">Sales Meeting</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Sales Followup" id="meeting-type-followup" />
                  <Label htmlFor="meeting-type-followup">Sales Follow-up</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Date <span className="text-red-500">*</span></Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}> <CalendarIcon className="mr-2 h-4 w-4" /> {date ? format(date, "dd.MM.yyyy") : <span>Select date</span>} </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={date}
                    onSelect={(selectedDate) => selectedDate && setDate(selectedDate)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="start-time">Start Time <span className="text-red-500">*</span></Label>
              <select id="start-time" className="w-full rounded-md border px-3 py-2 text-sm" value={startTime} onChange={handleStartTimeChange} required>
                <option value="" disabled>Select time</option>
                {generateTimeOptions()}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" placeholder="Add any internal notes about this meeting" value={notes} onChange={handleNotesChange} className="min-h-[100px]" />
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handleSubmitMeeting} className="bg-[#2E1813] hover:bg-[#2E1813]/90 text-white">
                Schedule Meeting
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add New Company Dialog */}
      <Dialog open={showAddCompanyDialog} onOpenChange={setShowAddCompanyDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Restaurant</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateCompany} className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="google-places-search">Search for Restaurant</Label>
              <div className="relative">
                <Input
                  id="google-places-search"
                  ref={googleSearchInputRef}
                  placeholder="Search for restaurant on Google..."
                  className="pl-9"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              <p className="text-xs text-gray-500">Search for an existing restaurant or fill in the details below</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company-name">Restaurant Name <span className="text-red-500">*</span></Label>
              <Input
                id="company-name"
                name="name"
                value={newCompany.name}
                onChange={handleNewCompanyChange}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="company-street">Street Address <span className="text-red-500">*</span></Label>
                <Input
                  id="company-street"
                  name="street"
                  value={newCompany.street}
                  onChange={handleNewCompanyChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-city">City <span className="text-red-500">*</span></Label>
                <Input
                  id="company-city"
                  name="city"
                  value={newCompany.city}
                  onChange={handleNewCompanyChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="company-postal">Postal Code <span className="text-red-500">*</span></Label>
                <Input
                  id="company-postal"
                  name="postalCode"
                  value={newCompany.postalCode}
                  onChange={handleNewCompanyChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-state">State</Label>
                <Input
                  id="company-state"
                  name="state"
                  value={newCompany.state}
                  onChange={handleNewCompanyChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company-cuisine">Cuisine</Label>
              <Select value={newCompany.cuisine} onValueChange={handleCuisineChange}>
                <SelectTrigger id="company-cuisine">
                  <SelectValue placeholder="Select cuisine type" />
                </SelectTrigger>
                <SelectContent>
                  {cuisineOptions.map(cuisine => (
                    <SelectItem key={cuisine} value={cuisine}>{cuisine}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddCompanyDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                Create Restaurant
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FloatingActionButton;
