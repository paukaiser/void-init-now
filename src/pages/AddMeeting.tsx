
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Calendar as CalendarIcon, Mic } from 'lucide-react';
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
  const [companyName, setCompanyName] = useState(prefilledData.companyName || "");
  const [contactName, setContactName] = useState(prefilledData.contactName || "");
  const [meetingType, setMeetingType] = useState<"sales meeting" | "sales followup">(
    isFollowUp ? "sales followup" : (prefilledData.meetingType || "sales meeting")
  );
  const [title, setTitle] = useState(prefilledData.title || "");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingComplete, setRecordingComplete] = useState(false);
  
  // For follow-up, we could fetch meeting details using the meetingId
  useEffect(() => {
    if (isFollowUp && prefilledData.meetingId) {
      // In a real app, you would fetch meeting details from Hubspot API using the meetingId
      // For now, simulate fetching data
      setTimeout(() => {
        // This would be data returned from the API
        setCompanyName('Sample Company');
        setContactName('John Doe');
        // Meeting type is already set to "sales followup" in the initial state
      }, 300);
    }
  }, [isFollowUp, prefilledData.meetingId]);
  
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
    
    if (!isRescheduling && !isFollowUp && (!companyName || !contactName || !title)) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    // In a real app, this would send data to Hubspot API
    if (isRescheduling) {
      toast.success("Meeting rescheduled successfully");
    } else if (isFollowUp) {
      // In a real app, this would send the recording to Zapier via webhook
      if (recordingComplete) {
        toast.success("Follow-up meeting scheduled with voice note");
      } else {
        toast.success("Follow-up meeting scheduled");
      }
    } else {
      toast.success("Meeting scheduled successfully");
    }
    
    navigate('/meetings');
  };
  
  const handleStartRecording = () => {
    // In a real app, this would start recording audio
    setIsRecording(true);
    
    // Simulate recording completion after 3 seconds
    setTimeout(() => {
      setIsRecording(false);
      setRecordingComplete(true);
      toast.success("Voice note recorded successfully");
      
      // In a real app, this would send the recording to Zapier via webhook
    }, 3000);
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
            {isRescheduling 
              ? "Reschedule Meeting" 
              : isFollowUp 
                ? "Schedule Follow-up Meeting"
                : "Schedule New Meeting"}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {!isRescheduling && !isFollowUp && (
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
              
              {isFollowUp && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company Name</Label>
                    <Input 
                      id="company" 
                      value={companyName} 
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="contact">Contact Name</Label>
                    <Input 
                      id="contact" 
                      value={contactName} 
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="meeting-type">Meeting Type</Label>
                    <Input 
                      id="meeting-type" 
                      value="Sales Follow-up" 
                      readOnly
                      className="bg-gray-50"
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
            
            {isFollowUp && (
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-lg font-medium mb-4">Voice Note</h3>
                <div className="flex items-center space-x-4">
                  <Button
                    type="button"
                    onClick={handleStartRecording}
                    disabled={isRecording || recordingComplete}
                    className={cn(
                      "allo-button-secondary",
                      isRecording && "bg-red-500 hover:bg-red-600 text-white"
                    )}
                  >
                    <Mic size={16} className="mr-2" />
                    {isRecording ? "Recording..." : recordingComplete ? "Recording Complete" : "Record Voice Note"}
                  </Button>
                  
                  {recordingComplete && (
                    <span className="text-green-600 text-sm">Voice note recorded and ready to send</span>
                  )}
                </div>
              </div>
            )}
            
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
