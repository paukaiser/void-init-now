
import React, { useState, useEffect, useRef } from 'react';
import { format, isSameDay, parseISO } from 'date-fns';
import MeetingCard, { Meeting } from './MeetingCard';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CalendarViewProps {
  userId: string;
  selectedDate?: Date;
}

const CalendarView: React.FC<CalendarViewProps> = ({ userId, selectedDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const calendarRef = useRef<HTMLDivElement>(null);
  
  const START_HOUR = 8; // 08:00
  const END_HOUR = 22; // 22:00
  
  // Use the selectedDate prop if provided
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
    const fetchMeetings = async () => {
      setLoading(true);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
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
          endTime: new Date(meetingTime1.getTime() + 60 * 60 * 1000).toISOString(),
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
          endTime: new Date(meetingTime2.getTime() + 40 * 60 * 1000).toISOString(),
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
          endTime: new Date(meetingTime3.getTime() + 2 * 60 * 60 * 1000).toISOString(),
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
          endTime: new Date(meetingTime4.getTime() + 75 * 60 * 1000).toISOString(),
          date: format(today, 'dd.MM.yyyy'),
          type: 'sales followup',
          status: 'rescheduled'
        }
      ];
      
      setMeetings(mockMeetings);
      setLoading(false);
    };
    
    fetchMeetings();
  }, [userId, currentDate]);
  
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
        />
      );
    });
    
    return dayCells;
  };
  
  return (
    <div className="w-full h-full flex flex-col animate-fade-in">
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
              {generateCalendarGrid()}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default CalendarView;
