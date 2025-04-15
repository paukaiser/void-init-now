import React, { useState, useEffect, useRef } from 'react';
import { format, isSameDay, parseISO } from 'date-fns';
import MeetingCard, { Meeting } from './MeetingCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMeetings } from '@/hooks/useMeetings';

interface CalendarViewProps {
  userId: string;
  selectedDate?: Date;
}

const CalendarView: React.FC<CalendarViewProps> = ({ userId, selectedDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [meetingToCancel, setMeetingToCancel] = useState<Meeting | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  const { meetings, isLoading, isError } = useMeetings();
  
  const START_HOUR = 8; // 08:00
  const END_HOUR = 22; // 22:00
  
  useEffect(() => {
    if (selectedDate) {
      setCurrentDate(selectedDate);
    }
  }, [selectedDate]);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);
  
  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading]);
  
  const timeToY = (time: Date): number => {
    const hours = time.getHours();
    const minutes = time.getMinutes();
    
    if (hours < START_HOUR || hours >= END_HOUR) {
      return -1; // Outside visible hours
    }
    
    const totalMinutesInView = (END_HOUR - START_HOUR) * 60;
    const minutesSinceStart = (hours - START_HOUR) * 60 + minutes;
    
    return (minutesSinceStart / totalMinutesInView) * 100;
  };
  
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = START_HOUR; hour < END_HOUR; hour++) {
      slots.push(
        <div 
          key={`time-${hour}`} 
          className="time-slot flex items-start justify-end pr-2 text-xs text-muted-foreground"
        >
          <span className="mt-[-10px] mr-1">{`${hour.toString().padStart(2, '0')}:00`}</span>
        </div>
      );
    }
    return slots;
  };
  
  const calculateCurrentTimePosition = () => {
    return timeToY(new Date());
  };

  const handleCancelMeeting = (meeting: Meeting) => {
    setMeetingToCancel(meeting);
  };

  const confirmCancelMeeting = () => {
    if (meetingToCancel) {
      navigate('/meeting-canceled', {
        state: {
          meetingDetails: {
            companyId: 'company-123', // Mock ID
            companyName: meetingToCancel.companyName,
            companyAddress: meetingToCancel.address || '123 Main St, San Francisco, CA', // Use real address if available
            contactId: 'contact-123', // Mock ID
            contactName: meetingToCancel.contactName
          }
        }
      });
    }
    setMeetingToCancel(null);
  };
  
  const generateCalendarGrid = () => {
    const dayCells = [];
    const currentTimePosition = calculateCurrentTimePosition();
    
    for (let hour = START_HOUR; hour <= END_HOUR; hour++) {
      dayCells.push(
        <div 
          key={`hour-line-${hour}`} 
          className="hour-grid-line"
          style={{
            top: `${((hour - START_HOUR) * 60) / ((END_HOUR - START_HOUR) * 60) * 100}%`
          }}
        />
      );
      
      if (hour < END_HOUR) {
        dayCells.push(
          <div 
            key={`half-hour-line-${hour}`} 
            className="minute-grid-line"
            style={{
              top: `${((hour - START_HOUR) * 60 + 30) / ((END_HOUR - START_HOUR) * 60) * 100}%`
            }}
          />
        );
      }
    }
    
    if (isSameDay(currentDate, new Date()) && currentTimePosition > 0 && currentTimePosition < 100) {
      dayCells.push(
        <div 
          key="current-time-indicator" 
          className="current-time-indicator"
          style={{ top: `${currentTimePosition}%` }}
        />
      );
    }
    
    meetings.filter(meeting => {
      const meetingDate = new Date(meeting.startTime);
      return isSameDay(meetingDate, currentDate);
    }).forEach(meeting => {
      dayCells.push(
        <MeetingCard 
          key={meeting.id} 
          meeting={meeting} 
          isCalendarView={true}
          startHour={START_HOUR}
          endHour={END_HOUR}
          onCancel={() => handleCancelMeeting(meeting)}
        />
      );
    });
    
    return dayCells;
  };
  
  return (
    <div className="w-full h-full flex flex-col animate-fade-in">
      {isError && (
        <div className="p-2 bg-red-100 text-red-800 rounded mb-2">
          Error loading meetings. Please try again later.
        </div>
      )}
      
      <ScrollArea className="flex-grow h-full">
        <div 
          className="calendar-grid daily-view rounded-lg border border-gray-200 bg-white/90 h-full relative"
        >
          <div className="flex flex-col min-w-[60px]">
            <div className="h-10 border-b border-gray-100"></div>
            {generateTimeSlots()}
          </div>
          <div className="flex flex-col flex-1 relative">
            <div className="text-center text-sm font-medium py-2 border-b border-gray-100 invisible">
              Spacer
            </div>
            <div 
              className="flex-1 relative"
              ref={calendarRef}
            >
              {loading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-pulse text-gray-400">Loading meetings...</div>
                </div>
              ) : (
                generateCalendarGrid()
              )}
            </div>
          </div>
        </div>
      </ScrollArea>

      <AlertDialog open={!!meetingToCancel} onOpenChange={(open) => !open && setMeetingToCancel(null)}>
        <AlertDialogContent className="max-w-[350px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <AlertTriangle className="text-red-500 mr-2 h-5 w-5" />
              Cancel Meeting
            </AlertDialogTitle>
            <AlertDialogDescription>
              {meetingToCancel && (
                <>Are you sure you want to cancel this meeting with {meetingToCancel.contactName} from {meetingToCancel.companyName}?</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, keep it</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancelMeeting} className="bg-red-600 hover:bg-red-700">
              Yes, cancel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CalendarView;
