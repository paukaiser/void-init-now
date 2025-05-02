import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Home, Clock, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from "../components/ui/button.tsx";
import { toast } from "sonner";
import AudioRecorder from '../components/AudioRecorder.tsx';
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover.tsx";
import { Calendar } from "../components/ui/calendar.tsx";
import { format } from "date-fns";
import { cn } from "../lib/utils.ts";
import { useMeetingContext } from '../context/MeetingContext.tsx';
import { useLocation } from 'react-router-dom'; // already imported? good




const FollowUpOutcome: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [showTaskOptions, setShowTaskOptions] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [showDateSelector, setShowDateSelector] = useState(false);
  const location = useLocation();
  const isHotDeal = location.state?.isHotDeal || false;
  const dealId = location.state?.dealId || null;

  const { meetings } = useMeetingContext();
  const meetingDetails = meetings.find(m => m.id === id);

  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (!meetingDetails) {
      toast.error("Meeting not found");
      navigate('/dashboard');
    }
  }, [meetingDetails, navigate]);

  useEffect(() => {
    if (meetingDetails && meetingDetails.completed) {
      setIsCompleted(true);
    }
  }, [meetingDetails]);

  const handleAudioSend = async (blob: Blob) => {
    setAudioBlob(blob);
    const formData = new FormData();
    formData.append('audio', blob, 'voice-note.webm');

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
    if (!meetingDetails) return;

    navigate('/add-meeting', {
      state: {
        isFollowUp: true,
        originalMeetingId: meetingDetails.id,
        meetingId: id,
        companyId: meetingDetails.companyId,
        companyName: meetingDetails.companyName,
        companyAddress: meetingDetails.address,
        contactId: meetingDetails.contactId,
        contactName: meetingDetails.contactName,
        dealId: meetingDetails.dealId,
        forceCompany: true,
        meetingType: meetingDetails.type,
        isHotDeal: isHotDeal,
      }
    });
  };

  const handleTaskSchedule = (timeframe: string) => {
    const today = new Date();
    let taskDate = new Date(today);

    const daysMap: { [key: string]: number } = {
      '3days': 3,
      '1week': 7,
      '2weeks': 14,
      '3weeks': 21
    };

    if (timeframe === 'custom') {
      setShowDateSelector(true);
      return;
    }

    taskDate.setDate(today.getDate() + (daysMap[timeframe] || 7));
    scheduleTask(taskDate);
  };

  const scheduleTask = (taskDate: Date) => {
    toast.success(`Follow-up task scheduled for ${format(taskDate, 'dd.MM.yyyy')}`);
    setShowTaskOptions(false);
    setShowDateSelector(false);
    navigate('/');
  };

  const handleComplete = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/meeting/${id}/mark-completed`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to mark meeting as completed");
      toast.success("Meeting marked as completed!");
    } catch (err) {
      toast.error("Failed to mark meeting as completed");
      console.error("Error marking meeting as completed:", err);
    }
    navigate('/dashboard');
  };

  const handleCalendarSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
      scheduleTask(selectedDate);
    }
  };

  if (!meetingDetails) return null;

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
                  disabled={isCompleted}
                >
                  <Clock size={18} className="mr-2" />
                  Schedule Follow-up Meeting
                </Button>

                <Button
                  className="flex items-center justify-center py-4 bg-amber-500 hover:bg-amber-600 text-white"
                  onClick={() => setShowTaskOptions(true)}
                  disabled={isCompleted}
                >
                  <Clock size={18} className="mr-2" />
                  Schedule Follow-up Task
                </Button>

                <Button
                  className="flex items-center justify-center"
                  onClick={handleComplete}
                  disabled={isCompleted}
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
