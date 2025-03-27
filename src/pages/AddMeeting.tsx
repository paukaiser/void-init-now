import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import CompanySearch, { Company } from '@/components/CompanySearch';

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
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [meetingType, setMeetingType] = useState<"sales meeting" | "sales followup">(
    isFollowUp ? "sales followup" : (prefilledData.meetingType || "sales meeting")
  );
  const [notes, setNotes] = useState(prefilledData.notes || "");
  
  // Check if company selection is forced (from task or canceled meeting)
  const forceCompany = prefilledData.forceCompany || false;
  
  // For follow-up, canceled meeting, or rescheduling we use prefilled company data
  useEffect(() => {
    if ((isFollowUp || forceCompany || isRescheduling) && prefilledData.companyName) {
      // Create a company object from the prefilled data
      const company: Company = {
        id: prefilledData.companyId || 'temp-id',
        name: prefilledData.companyName,
        address: prefilledData.companyAddress || 'Unknown Address'
      };
      
      setSelectedCompany(company);
    }
  }, [isFollowUp, forceCompany, isRescheduling, prefilledData]);
  
  // Process preselected times if provided
  useEffect(() => {
    if (prefilledData.preselectedStartTime) {
      const startDate = new Date(prefilledData.preselectedStartTime);
      setStartTime(`${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`);
    }
  }, [prefilledData]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!date || !startTime) {
      toast.error("Please select date and time");
      return;
    }
    
    if (!forceCompany && !isFollowUp && !selectedCompany) {
      toast.error("Please select a company");
      return;
    }
    
    // Generate meeting title based on company name and meeting type
    const company = selectedCompany?.name || prefilledData.companyName || "Unknown Company";
    const meetingTypeLabel = meetingType === "sales meeting" ? "Meeting" : "Followup";
    const title = `allO x ${company} - ${meetingTypeLabel}`;
    
    // Calculate end time (1 hour after start time)
    const meetingDate = new Date(date);
    const [startHour, startMinute] = startTime.split(':').map(Number);
    meetingDate.setHours(startHour, startMinute, 0, 0);
    
    const endDate = new Date(meetingDate);
    endDate.setHours(endDate.getHours() + 1);
    const endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
    
    const isInPast = meetingDate < new Date();
    
    // In a real app, this would send data to Hubspot API
    console.log("Meeting data:", {
      title,
      company: selectedCompany || { name: prefilledData.companyName, id: prefilledData.companyId },
      meetingType,
      date: format(date, 'dd.MM.yyyy'),
      startTime,
      endTime,
      notes
    });
    
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
  
  const generateTimeOptions = () => {
    const options = [];
    const startHour = 7; // 7 AM
    const endHour = 21; // 9 PM
    
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
  
  // Determine what form elements to show based on context
  const showCompanySelection = !forceCompany && !isFollowUp && !isRescheduling;
  const showMeetingTypeSelection = !isFollowUp && !forceCompany && !isRescheduling;
  const showMeetingTypeDisplay = isFollowUp;
  const showCompanyDetails = (forceCompany || isFollowUp || isRescheduling) && (selectedCompany || prefilledData.companyName);
  
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
              {showCompanySelection && (
                <div className="md:col-span-2">
                  <CompanySearch 
                    onSelect={setSelectedCompany}
                    value={selectedCompany}
                    required={true}
                  />
                </div>
              )}
              
              {showCompanyDetails && (
                <div className="md:col-span-2">
                  <div className="border rounded-md p-3 bg-gray-50">
                    <Label className="block mb-1 text-sm">Company</Label>
                    <p className="font-medium">{selectedCompany?.name || prefilledData.companyName}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedCompany?.address || prefilledData.companyAddress || 'Address not available'}
                    </p>
                  </div>
                </div>
              )}
              
              {/* Only show meeting type radio selection for new meetings */}
              {showMeetingTypeSelection && (
                <div className="md:col-span-2 space-y-2">
                  <Label>Meeting Type <span className="text-red-500">*</span></Label>
                  <RadioGroup 
                    defaultValue={meetingType}
                    onValueChange={(value: "sales meeting" | "sales followup") => setMeetingType(value)}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="sales meeting" id="meeting-type-sales" />
                      <Label htmlFor="meeting-type-sales" className="cursor-pointer">Sales Meeting</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="sales followup" id="meeting-type-followup" />
                      <Label htmlFor="meeting-type-followup" className="cursor-pointer">Sales Follow-up</Label>
                    </div>
                  </RadioGroup>
                </div>
              )}
              
              {showMeetingTypeDisplay && (
                <div className="space-y-2 md:col-span-2">
                  <Label>Meeting Type</Label>
                  <div className="text-sm bg-gray-50 border rounded p-2">Sales Follow-up</div>
                </div>
              )}
              
              <div className="space-y-2 md:col-span-2">
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
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="start-time">Start Time <span className="text-red-500">*</span></Label>
                <select
                  id="start-time"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                >
                  <option value="" disabled>Select time</option>
                  {generateTimeOptions()}
                </select>
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
