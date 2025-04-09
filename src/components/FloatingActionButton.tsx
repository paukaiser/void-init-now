
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Calendar, FileText, CalendarIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import CompanySearch from '@/components/CompanySearch';

interface FloatingActionButtonProps {
  onCreateTask?: () => void;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onCreateTask }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreateMeetingDialogOpen, setIsCreateMeetingDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<{ id: string; name: string; address: string } | null>(null);
  const [meetingType, setMeetingType] = useState<"sales meeting" | "sales followup">("sales meeting");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState("");
  const [notes, setNotes] = useState("");
  
  const navigate = useNavigate();
  const fabRef = useRef<HTMLDivElement>(null);

  const toggleOptions = () => {
    setIsOpen(!isOpen);
  };

  const handleCreateMeeting = () => {
    setIsOpen(false);
    setIsCreateMeetingDialogOpen(true);
  };

  const handleCreateTask = () => {
    setIsOpen(false);
    if (onCreateTask) {
      onCreateTask();
    }
  };
  
  const handleSubmitMeeting = () => {
    if (!selectedCompany || !date || !startTime) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    const meetingTitle = `allO x ${selectedCompany.name} - ${meetingType === "sales meeting" ? "Meeting" : "Followup"}`;
    
    toast.success(`Meeting "${meetingTitle}" scheduled successfully`);
    setIsCreateMeetingDialogOpen(false);
    
    // Reset form fields
    setSelectedCompany(null);
    setMeetingType("sales meeting");
    setDate(undefined);
    setStartTime("");
    setNotes("");
    
    // Optional: Navigate to meetings page after creation
    // navigate('/meetings');
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fabRef.current && !fabRef.current.contains(event.target as Node) && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <>
      {/* Overlay that darkens the screen when FAB is open */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-30"
          aria-hidden="true"
        />
      )}
      
      <div 
        ref={fabRef}
        className="fixed bottom-6 right-6 z-40"
      >
        <div className="flex flex-col items-end space-y-4">
          {/* Task button - appears above the main button when open */}
          {isOpen && (
            <div className="flex items-center">
              <span className="mr-2 bg-white/80 backdrop-blur-sm px-2 py-1 rounded text-[#2E1813] text-sm shadow-sm">
                Task
              </span>
              <button 
                className="bg-black hover:bg-black/90 text-[#FF8769] rounded-full shadow-lg w-12 h-12 flex items-center justify-center"
                onClick={handleCreateTask}
                aria-label="Create Task"
              >
                <FileText size={20} />
              </button>
            </div>
          )}
          
          {/* Main FAB button */}
          <div className="flex items-center">
            {isOpen && (
              <span className="mr-2 bg-white/80 backdrop-blur-sm px-2 py-1 rounded text-[#2E1813] text-sm shadow-sm">
                Meeting
              </span>
            )}
            <button 
              className="bg-black hover:bg-black/90 text-[#FF8769] rounded-full shadow-lg w-14 h-14 flex items-center justify-center"
              onClick={toggleOptions}
              aria-label={isOpen ? "Close Menu" : "Open Menu"}
            >
              {isOpen ? (
                <Calendar size={24} onClick={handleCreateMeeting} />
              ) : (
                <Plus size={24} />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Create Meeting Dialog */}
      <Dialog open={isCreateMeetingDialogOpen} onOpenChange={setIsCreateMeetingDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule New Meeting</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company Name <span className="text-red-500">*</span></Label>
              <CompanySearch 
                onSelect={setSelectedCompany}
                value={selectedCompany}
                required={true}
              />
            </div>
            
            <div className="space-y-2">
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
                  <CalendarComponent
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
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
                {generateTimeOptions()}
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea 
                id="notes" 
                placeholder="Add any internal notes about this meeting" 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            
            <div className="flex justify-end pt-4">
              <Button 
                onClick={handleSubmitMeeting}
                className="bg-[#2E1813] hover:bg-[#2E1813]/90 text-white"
              >
                Schedule Meeting
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FloatingActionButton;
