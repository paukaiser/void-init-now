
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Calendar as CalendarIcon } from 'lucide-react';
import { format, parse } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const AddMeeting: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if we're rescheduling
  const isRescheduling = location.pathname.includes('reschedule') || 
                        (location.state && location.state.isRescheduling);
  
  // Get prefilled data if any
  const prefilledData = location.state || {};
  
  const [date, setDate] = useState<Date | undefined>(
    prefilledData.preselectedDate 
      ? new Date(prefilledData.preselectedDate) 
      : undefined
  );
  
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [companyName, setCompanyName] = useState(prefilledData.companyName || "");
  const [contactName, setContactName] = useState(prefilledData.contactName || "");
  const [meetingType, setMeetingType] = useState<"sales meeting" | "sales followup">(
    prefilledData.meetingType || "sales meeting"
  );
  const [title, setTitle] = useState(prefilledData.title || "");
  
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
    
    // Validate form based on whether we're rescheduling or not
    if (!date || !startTime || !endTime) {
      toast.error("Please select date and time");
      return;
    }
    
    if (!isRescheduling && (!companyName || !contactName || !title)) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    // In a real app, you would save the meeting to your API
    if (isRescheduling) {
      toast.success("Meeting rescheduled successfully");
    } else {
      toast.success("Meeting scheduled successfully");
    }
    
    navigate('/meetings');
  };
  
  const generateTimeOptions = () => {
    const options = [];
    
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
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
            {isRescheduling ? "Reschedule Meeting" : "Schedule New Meeting"}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {!isRescheduling && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="title">Meeting Title</Label>
                    <Input 
                      id="title" 
                      placeholder="Enter meeting title" 
                      value={title} 
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="meeting-type">Meeting Type</Label>
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
                  
                  <div className="space-y-2">
                    <Label htmlFor="company">Company Name</Label>
                    <Input 
                      id="company" 
                      placeholder="Enter company name" 
                      value={companyName} 
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="contact">Contact Name</Label>
                    <Input 
                      id="contact" 
                      placeholder="Enter contact name" 
                      value={contactName} 
                      onChange={(e) => setContactName(e.target.value)}
                    />
                  </div>
                </>
              )}
              
              <div className="space-y-2">
                <Label>Date</Label>
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
                  <Label htmlFor="start-time">Start Time</Label>
                  <select
                    id="start-time"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  >
                    <option value="" disabled>Select time</option>
                    {generateTimeOptions()}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="end-time">End Time</Label>
                  <select
                    id="end-time"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  >
                    <option value="" disabled>Select time</option>
                    {generateTimeOptions()}
                  </select>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end pt-4">
              <Button type="submit" className="allo-button">
                {isRescheduling ? "Reschedule Meeting" : "Schedule Meeting"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddMeeting;
