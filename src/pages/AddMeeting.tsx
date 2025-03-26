
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import CompanySearch, { Company } from '@/components/CompanySearch';
import ContactSearch, { Contact } from '@/components/ContactSearch';

const AddMeeting: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if we're rescheduling or following up
  const isRescheduling = location.pathname.includes('reschedule') || 
                        (location.state && location.state.isRescheduling);
  const isFollowUp = location.state && location.state.isFollowUp;
  
  // Get prefilled data if any
  const prefilledData = location.state || {};
  
  const [date, setDate] = useState<Date | undefined>(
    prefilledData.preselectedDate 
      ? new Date(prefilledData.preselectedDate) 
      : undefined
  );
  
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [meetingType, setMeetingType] = useState<"sales meeting" | "sales followup">(
    isFollowUp ? "sales followup" : (prefilledData.meetingType || "sales meeting")
  );
  const [title, setTitle] = useState(prefilledData.title || "");
  const [notes, setNotes] = useState(prefilledData.notes || "");
  
  // Auto generate meeting title when company, contact and meeting type are selected
  useEffect(() => {
    if (selectedCompany && meetingType) {
      const meetingTypeLabel = meetingType === "sales meeting" ? "Meeting" : "Followup";
      const newTitle = `allO x ${selectedCompany.name} - ${meetingTypeLabel}`;
      setTitle(newTitle);
    }
  }, [selectedCompany, meetingType]);
  
  // Auto set end time to 1 hour after start time when start time is selected
  useEffect(() => {
    if (startTime) {
      const [hours, minutes] = startTime.split(':').map(Number);
      const endHour = hours + 1 >= 24 ? 23 : hours + 1;
      const formattedEndHour = endHour.toString().padStart(2, '0');
      const formattedEndMinute = minutes.toString().padStart(2, '0');
      setEndTime(`${formattedEndHour}:${formattedEndMinute}`);
    }
  }, [startTime]);
  
  // For follow-up, we could fetch meeting details using the meetingId
  useEffect(() => {
    if (isFollowUp && prefilledData.meetingId) {
      // In a real app, you would fetch meeting details from Hubspot API using the meetingId
      // For now, simulate fetching data
      setTimeout(() => {
        // This would be data returned from the API
        const mockCompany: Company = {
          id: '1',
          name: prefilledData.companyName || 'Sample Company',
          address: '123 Main St, San Francisco, CA 94105'
        };
        
        const mockContact: Contact = {
          id: '1',
          fullName: prefilledData.contactName || 'John Doe',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@sample.com',
          companyId: '1'
        };
        
        setSelectedCompany(mockCompany);
        setSelectedContact(mockContact);
        // Meeting type is already set to "sales followup" in the initial state
      }, 300);
    } else if (prefilledData.companyName) {
      // This is for the case when a meeting was canceled and we're creating a new one
      const mockCompany: Company = {
        id: prefilledData.companyId || 'temp-id',
        name: prefilledData.companyName,
        address: prefilledData.companyAddress || 'Unknown Address'
      };
      
      setSelectedCompany(mockCompany);
      
      if (prefilledData.contactName) {
        const mockContact: Contact = {
          id: prefilledData.contactId || 'temp-id',
          fullName: prefilledData.contactName,
          companyId: mockCompany.id
        };
        
        setSelectedContact(mockContact);
      }
    }
  }, [isFollowUp, prefilledData]);
  
  // Process preselected times if provided
  useEffect(() => {
    if (prefilledData.preselectedStartTime) {
      const startDate = new Date(prefilledData.preselectedStartTime);
      setStartTime(`${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`);
    }
    
    if (prefilledData.preselectedEndTime) {
      const endDate = new Date(prefilledData.preselectedEndTime);
      setEndTime(`${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`);
    }
  }, [prefilledData]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!date || !startTime || !endTime) {
      toast.error("Please select date and time");
      return;
    }
    
    if (!selectedCompany || !title) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    // Check if meeting is in the past
    const meetingDate = new Date(date);
    const [startHour, startMinute] = startTime.split(':').map(Number);
    meetingDate.setHours(startHour, startMinute, 0, 0);
    
    const isInPast = meetingDate < new Date();
    
    // In a real app, this would send data to Hubspot API
    // The API call would differ based on whether the meeting is in the past or future
    if (isInPast) {
      // For past meetings, log as completed
      console.log("Logging completed meeting to Hubspot");
      toast.success("Past meeting logged as completed");
    } else {
      // For future meetings, schedule as normal
      if (isRescheduling) {
        console.log("Rescheduling meeting in Hubspot");
        toast.success("Meeting rescheduled successfully");
      } else if (isFollowUp) {
        console.log("Scheduling follow-up meeting");
        toast.success("Follow-up meeting scheduled");
      } else {
        console.log("Scheduling new meeting in Hubspot");
        toast.success("Meeting scheduled successfully");
      }
    }
    
    navigate('/meetings');
  };
  
  const generateTimeOptions = (isStartTime = true) => {
    const options = [];
    const startHour = 7; // 7 AM
    const endHour = isStartTime ? 21 : 24; // 9 PM for start times, midnight for end times
    
    for (let hour = startHour; hour < endHour; hour++) {
      // For half-hour increments (0 and 30 minutes)
      for (let minute of [0, 30]) {
        const formattedHour = hour.toString().padStart(2, '0');
        const formattedMinute = minute.toString().padStart(2, '0');
        const timeValue = `${formattedHour}:${formattedMinute}`;
        
        options.push(
          <option key={timeValue} value={timeValue}>
            {timeValue}
          </option>
        );
      }
    }
    
    return options;
  };
  
  return (
    <div className="allo-page">
      <div className="w-full max-w-3xl mx-auto py-4">
        <Button 
          variant="outline" 
          className="mb-6"
          onClick={() => navigate('/meetings')}
        >
          <ChevronLeft size={16} className="mr-1" />
          Back to Meetings
        </Button>
        
        <div className="allo-card w-full">
          <h2 className="text-xl font-semibold mb-6">
            {isRescheduling 
              ? "Reschedule Meeting" 
              : isFollowUp 
                ? "Schedule Follow-up Meeting"
                : "Schedule New Meeting"}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {!isRescheduling && (
                <>
                  <div className="md:col-span-2">
                    <CompanySearch 
                      onSelect={setSelectedCompany}
                      value={selectedCompany}
                      required={true}
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <ContactSearch 
                      onSelect={setSelectedContact}
                      value={selectedContact}
                      selectedCompany={selectedCompany}
                      disabled={!selectedCompany}
                    />
                  </div>
                  
                  {!isFollowUp && (
                    <div className="space-y-2">
                      <Label htmlFor="meeting-type">Meeting Type <span className="text-red-500">*</span></Label>
                      <Select 
                        value={meetingType} 
                        onValueChange={(value: "sales meeting" | "sales followup") => setMeetingType(value)}
                      >
                        <SelectTrigger id="meeting-type">
                          <SelectValue placeholder="Select meeting type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sales meeting">Sales Meeting</SelectItem>
                          <SelectItem value="sales followup">Sales Follow-up</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  {isFollowUp && (
                    <div className="space-y-2">
                      <Label htmlFor="meeting-type">Meeting Type</Label>
                      <Input 
                        id="meeting-type" 
                        value="Sales Follow-up" 
                        readOnly
                        className="bg-gray-50"
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="title">Meeting Title <span className="text-red-500">*</span></Label>
                    <Input 
                      id="title" 
                      placeholder="Enter meeting title" 
                      value={title} 
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>
                </>
              )}
              
              <div className="space-y-2">
                <Label>Date <span className="text-red-500">*</span></Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "dd.MM.yyyy") : <span>Select date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="start-time">Start Time <span className="text-red-500">*</span></Label>
                  <select
                    id="start-time"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  >
                    <option value="" disabled>Select time</option>
                    {generateTimeOptions(true)}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="end-time">End Time <span className="text-red-500">*</span></Label>
                  <select
                    id="end-time"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  >
                    <option value="" disabled>Select time</option>
                    {generateTimeOptions(false)}
                  </select>
                </div>
              </div>
              
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea 
                  id="notes" 
                  placeholder="Add any internal notes about this meeting" 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>
            
            <div className="flex justify-end pt-4">
              <Button type="submit" className="allo-button">
                {isRescheduling ? "Reschedule Meeting" : isFollowUp ? "Schedule Follow-up" : "Schedule Meeting"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddMeeting;
