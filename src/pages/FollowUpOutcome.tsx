
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Home, Clock, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from "../components/ui/button.tsx";
import { toast } from "sonner";
import AudioRecorder from '../components/AudioRecorder.tsx';
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover.tsx";
import { Calendar } from "../components/ui/calendar.tsx";
import { format } from "date-fns";
import { cn } from "../lib/utils.ts";
import { useLocation } from 'react-router-dom';

const FollowUpOutcome: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [showTaskOptions, setShowTaskOptions] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [showDateSelector, setShowDateSelector] = useState(false);

  const location = useLocation();
  const isHotDeal = location.state?.isHotDeal;
  const dealId = location.state?.dealId;

  const handleAudioSend = async (blob: Blob) => {
    setAudioBlob(blob);

    // Build FormData for file upload
    const formData = new FormData();
    formData.append('audio', blob, 'voice-note.webm'); // Use the correct extension
    console.log('Audio blob:', blob); // Log the blob instead of undefined req.file
    console.log('Forwarding audio to Zapier...');
    try {
      const response = await fetch('http://localhost:3000/api/meeting/send-voice', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to send audio to backend');
      toast.success("Voice note recorded and sent successfully");
    } catch (err) {
      toast.error("Failed to send voice note");
      console.error("Backend error:", err);
    }
  };

  const handleScheduleFollowUp = () => {
    // In a real app, you would fetch meeting details from the API
    // For demonstration purposes, we're using mock data
    const mockMeetingDetails = {
      companyId: 'mock-company-id',
      companyName: 'Acme Inc',
      companyAddress: '123 Main St, San Francisco, CA',
      contactId: 'mock-contact-id',
      contactName: 'John Doe',
      meetingType: 'sales followup'
    };

    // Navigate to add meeting page with follow-up data
    navigate('/add-meeting', {
      state: {
        isFollowUp: true,
        meetingId: id,
        companyId: mockMeetingDetails.companyId,
        companyName: mockMeetingDetails.companyName,
        companyAddress: mockMeetingDetails.companyAddress,
        contactId: mockMeetingDetails.contactId,
        contactName: mockMeetingDetails.contactName,
        forceCompany: true // Force company selection to be disabled
      }
    });
  };

  const handleTaskSchedule = (timeframe: string) => {
    let taskDate: Date;
    const today = new Date();

    switch (timeframe) {
      case '3days':
        taskDate = new Date(today);
        taskDate.setDate(today.getDate() + 3);
        break;
      case '1week':
        taskDate = new Date(today);
        taskDate.setDate(today.getDate() + 7);
        break;
      case '2weeks':
        taskDate = new Date(today);
        taskDate.setDate(today.getDate() + 14);
        break;
      case '3weeks':
        taskDate = new Date(today);
        taskDate.setDate(today.getDate() + 21);
        break;
      case 'custom':
        setShowDateSelector(true);
        return;
      default:
        taskDate = new Date(today);
        taskDate.setDate(today.getDate() + 7);
    }

    scheduleTask(taskDate);
  };

  const scheduleTask = (taskDate: Date) => {
    // In a real app, this would create a task in your API
    console.log(`Scheduling follow-up task for ${format(taskDate, 'dd.MM.yyyy')}`);

    // Simulate API call success
    toast.success(`Follow-up task scheduled for ${format(taskDate, 'dd.MM.yyyy')}`);

    // Close the task options and reset
    setShowTaskOptions(false);
    setShowDateSelector(false);

    // Navigate to home page
    navigate('/');
  };

  const handleComplete = async () => {
    // Step 1: Mark meeting as completed in backend (and HubSpot)
    try {
      const response = await fetch(`http://localhost:3000/api/meeting/${id}/mark-completed`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to mark meeting as completed");
      toast.success("Meeting marked as negative outcome and completed!");
    } catch (err) {
      toast.error("Failed to mark meeting as completed");
      console.error("Error marking meeting as completed:", err);
    }
    // Step 2: Navigate away
    navigate('/dashboard');
  };

  const handleScheduleFollowUpTask = () => {
    setShowTaskOptions(true);
  };

  const handleCalendarSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
      scheduleTask(selectedDate);
    }
  };

  return (
    <div className="allo-page">
      <div className="allo-container">
        <Button
          variant="outline"
          className="self-start mb-6"
          onClick={() => navigate(`/meeting/${id}/outcome`)}
        >
          <ChevronLeft size={16} className="mr-1" />
          Back
        </Button>

        <div className="w-full max-w-md mx-auto">
          <h2 className="text-xl font-semibold mb-8 text-center">Follow-Up</h2>

          {!showTaskOptions ? (
            <>
              <div className="allo-card mb-6">
                <AudioRecorder onSend={handleAudioSend} />
              </div>

              <div className="flex flex-col space-y-4">
                <Button
                  className="flex items-center justify-center py-4 bg-blue-500 hover:bg-blue-600 text-white"
                  onClick={handleScheduleFollowUp}
                >
                  <Clock size={18} className="mr-2" />
                  Schedule Follow-up Meeting
                </Button>

                <Button
                  className="flex items-center justify-center py-4 bg-amber-500 hover:bg-amber-600 text-white"
                  onClick={handleScheduleFollowUpTask}
                >
                  <Clock size={18} className="mr-2" />
                  Schedule Follow-up Task
                </Button>

                <Button
                  className="flex items-center justify-center"
                  onClick={handleComplete}
                >
                  <Home size={18} className="mr-2" />
                  Return to Homepage
                </Button>
              </div>
            </>
          ) : (
            <div className="allo-card">
              <h3 className="text-lg font-medium mb-4">When to follow up?</h3>

              {showDateSelector ? (
                <div className="mb-4">
                  <Popover open={true}>
                    <PopoverTrigger asChild>
                      <div></div>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 pointer-events-auto" align="center">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={handleCalendarSelect}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  <Button onClick={() => handleTaskSchedule('3days')}>In 3 days</Button>
                  <Button onClick={() => handleTaskSchedule('1week')}>In 1 week</Button>
                  <Button onClick={() => handleTaskSchedule('2weeks')}>In 2 weeks</Button>
                  <Button onClick={() => handleTaskSchedule('3weeks')}>In 3 weeks</Button>
                  <Button
                    className="bg-gray-100 text-gray-800 hover:bg-gray-200"
                    onClick={() => handleTaskSchedule('custom')}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    Select a date
                  </Button>

                  <Button
                    variant="outline"
                    className="mt-2"
                    onClick={() => setShowTaskOptions(false)}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowUpOutcome;

function setStep(arg0: string) {
  throw new Error('Function not implemented.');
}
