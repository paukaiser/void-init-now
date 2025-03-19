
import React, { useState, useEffect } from 'react';
import { format, addDays, isSameDay, parseISO, getWeek, startOfWeek, subDays } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import MeetingCard, { Meeting } from './MeetingCard';
import { useNavigate } from 'react-router-dom';

interface CalendarViewProps {
  userId: string;
}

const CalendarView: React.FC<CalendarViewProps> = ({ userId }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();
  
  const START_HOUR = 8; // 08:00
  const END_HOUR = 22; // 22:00
  
  const getWeekNumber = (date: Date) => {
    return getWeek(date);
  };
  
  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);
  
  useEffect(() => {
    const fetchMeetings = async () => {
      setLoading(true);
      
      // In a real app, you would fetch meetings from Hubspot API
      // For now, we'll use mock data with the specific meeting times requested
      setTimeout(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Set specific times as requested
        const meetingTime1 = new Date(today);
        meetingTime1.setHours(9, 0, 0);
        
        const meetingTime2 = new Date(today);
        meetingTime2.setHours(11, 30, 0);
        
        const meetingTime3 = new Date(today);
        meetingTime3.setHours(13, 45, 0);
        
        const meetingTime4 = new Date(today);
        meetingTime4.setHours(16, 0, 0);
        
        const mockMeetings: Meeting[] = [
          {
            id: '1',
            title: 'Product Demo',
            contactName: 'Sarah Chen',
            companyName: 'Acme Inc',
            startTime: meetingTime1.toISOString(),
            endTime: new Date(meetingTime1.getTime() + 60 * 60 * 1000).toISOString(), // 1 hour
            date: format(today, 'dd.MM.yyyy'),
            type: 'sales meeting',
            status: 'scheduled'
          },
          {
            id: '2',
            title: 'Contract Discussion',
            contactName: 'Michael Rodriguez',
            companyName: 'Global Tech',
            startTime: meetingTime2.toISOString(),
            endTime: new Date(meetingTime2.getTime() + 40 * 60 * 1000).toISOString(), // 40 minutes
            date: format(today, 'dd.MM.yyyy'),
            type: 'sales followup',
            status: 'completed'
          },
          {
            id: '3',
            title: 'Initial Consultation',
            contactName: 'David Park',
            companyName: 'Innovate Solutions',
            startTime: meetingTime3.toISOString(),
            endTime: new Date(meetingTime3.getTime() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours
            date: format(today, 'dd.MM.yyyy'),
            type: 'sales meeting',
            status: 'scheduled'
          },
          {
            id: '4',
            title: 'Product Roadmap',
            contactName: 'Emma Watson',
            companyName: 'Tech Forward',
            startTime: meetingTime4.toISOString(),
            endTime: new Date(meetingTime4.getTime() + 75 * 60 * 1000).toISOString(), // 75 minutes
            date: format(today, 'dd.MM.yyyy'),
            type: 'sales followup',
            status: 'rescheduled'
          }
        ];
        
        setMeetings(mockMeetings);
        setLoading(false);
      }, 1000);
    };
    
    fetchMeetings();
  }, [userId, currentDate]);
  
  const handlePreviousDay = () => {
    setCurrentDate(prevDate => subDays(prevDate, 1));
  };
  
  const handleNextDay = () => {
    setCurrentDate(prevDate => addDays(prevDate, 1));
  };
  
  const handleAddMeeting = (hour?: number, minute?: number) => {
    if (hour !== undefined && minute !== undefined) {
      // If time is selected, pre-fill the time in the add meeting page
      // This would be implemented in a real app
      console.log(`Add meeting at ${hour}:${minute}`);
    }
    navigate('/add-meeting');
  };
  
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = START_HOUR; hour < END_HOUR; hour++) {
      slots.push(
        <div 
          key={`time-${hour}`} 
          className="time-slot flex items-start justify-end pr-2 text-xs text-allo-muted"
        >
          <span className="mt-[-10px] mr-1">{`${hour.toString().padStart(2, '0')}:00`}</span>
        </div>
      );
    }
    return slots;
  };
  
  const calculateCurrentTimePosition = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    
    if (hours < START_HOUR || hours >= END_HOUR) {
      return null; // Outside visible hours
    }
    
    const totalMinutesInView = (END_HOUR - START_HOUR) * 60;
    const minutesSinceStart = (hours - START_HOUR) * 60 + minutes;
    
    return (minutesSinceStart / totalMinutesInView) * 100;
  };
  
  const generateCalendarGrid = () => {
    const dayCells = [];
    const currentTimePosition = calculateCurrentTimePosition();
    
    // Create clickable empty slots
    for (let hour = START_HOUR; hour < END_HOUR; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const slotTime = new Date(currentDate);
        slotTime.setHours(hour, minute, 0, 0);
        
        const isPast = slotTime < new Date();
        
        dayCells.push(
          <div 
            key={`slot-${hour}-${minute}`} 
            className={`empty-slot absolute hover:bg-blue-50 cursor-pointer transition-colors`}
            style={{
              top: `${((hour - START_HOUR) * 60 + minute) / ((END_HOUR - START_HOUR) * 60) * 100}%`,
              height: '15px',
              width: '100%',
              zIndex: 1
            }}
            onClick={() => handleAddMeeting(hour, minute)}
            title={`Add meeting at ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`}
          />
        );
      }
    }
    
    // Add current time indicator if it's today and within visible hours
    if (isSameDay(currentDate, new Date()) && currentTimePosition !== null) {
      dayCells.push(
        <div 
          key="current-time-indicator" 
          className="current-time-indicator"
          style={{ top: `${currentTimePosition}%` }}
        />
      );
    }
    
    // Add meetings
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
        />
      );
    });
    
    return dayCells;
  };
  
  return (
    <div className="w-full flex flex-col space-y-4 animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">My Meetings</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handlePreviousDay}>
            <ChevronLeft size={16} />
          </Button>
          <Button variant="outline" onClick={handleNextDay}>
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>
      
      <div className="calendar-header bg-white/90 rounded-t-lg border border-gray-200 p-4 mb-0 border-b-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium bg-gray-100 py-1 px-2 rounded">
              KW {getWeekNumber(currentDate)}
            </span>
            <span className="text-lg font-medium">
              {format(currentDate, 'EEEE, dd.MM.yyyy')}
            </span>
          </div>
        </div>
      </div>
      
      <div className="calendar-grid daily-view rounded-b-lg border border-gray-200 bg-white/90 overflow-auto relative">
        <div className="flex flex-col min-w-[60px]">
          <div className="h-10 border-b border-gray-100"></div>
          {generateTimeSlots()}
        </div>
        <div className="flex flex-col flex-1 relative">
          <div className="text-center text-sm font-medium py-2 border-b border-gray-100 invisible">
            Spacer
          </div>
          <div className="flex-1 relative">
            {generateCalendarGrid()}
          </div>
        </div>
      </div>
      
      <Button 
        className="allo-button mt-4 self-center"
        onClick={() => handleAddMeeting()}
      >
        <Plus size={16} className="mr-1" />
        Add New Meeting
      </Button>
    </div>
  );
};

export default CalendarView;
