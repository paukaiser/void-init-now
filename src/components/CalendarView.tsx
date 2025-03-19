
import React, { useState, useEffect } from 'react';
import { format, addDays, isSameDay, parseISO, getWeek, startOfWeek, addWeeks } from 'date-fns';
import { ChevronDown, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import MeetingCard, { Meeting } from './MeetingCard';
import { useNavigate } from 'react-router-dom';

type ViewMode = 'day' | 'three-days' | 'week' | 'week-no-weekend';

interface CalendarViewProps {
  userId: string;
}

const CalendarView: React.FC<CalendarViewProps> = ({ userId }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const START_HOUR = 8; // 08:00
  const END_HOUR = 22; // 22:00
  
  const getWeekNumber = (date: Date) => {
    return getWeek(date);
  };
  
  useEffect(() => {
    const fetchMeetings = async () => {
      setLoading(true);
      
      // In a real app, you would fetch meetings from Hubspot API
      // For now, we'll use mock data
      setTimeout(() => {
        const mockMeetings: Meeting[] = [
          {
            id: '1',
            title: 'Product Demo',
            contactName: 'Sarah Chen',
            companyName: 'Acme Inc',
            startTime: '2023-06-15T10:00:00',
            endTime: '2023-06-15T11:00:00',
            date: 'Jun 15, 2023',
            type: 'sales meeting',
            status: 'scheduled'
          },
          {
            id: '2',
            title: 'Contract Discussion',
            contactName: 'Michael Rodriguez',
            companyName: 'Global Tech',
            startTime: '2023-06-15T14:30:00',
            endTime: '2023-06-15T15:30:00',
            date: 'Jun 15, 2023',
            type: 'sales followup',
            status: 'completed'
          },
          {
            id: '3',
            title: 'Initial Consultation',
            contactName: 'David Park',
            companyName: 'Innovate Solutions',
            startTime: '2023-06-16T09:15:00',
            endTime: '2023-06-16T10:15:00',
            date: 'Jun 16, 2023',
            type: 'sales meeting',
            status: 'scheduled'
          }
        ];
        
        // Update dates to be relative to today
        const today = new Date();
        
        const updatedMeetings = mockMeetings.map(meeting => {
          const daysToAdd = Math.floor(Math.random() * 3); // Random 0-2 days from today
          
          const newDate = addDays(today, daysToAdd);
          const formattedDate = format(newDate, 'yyyy-MM-dd');
          
          const startTime = meeting.startTime.split('T')[1];
          const endTime = meeting.endTime.split('T')[1];
          
          return {
            ...meeting,
            startTime: `${formattedDate}T${startTime}`,
            endTime: `${formattedDate}T${endTime}`,
            date: format(newDate, 'dd.MM.yyyy') // German date format
          };
        });
        
        setMeetings(updatedMeetings);
        setLoading(false);
      }, 1000);
    };
    
    fetchMeetings();
  }, [userId]);
  
  const getViewText = () => {
    switch(viewMode) {
      case 'day': return 'Today';
      case 'three-days': return '3 Days';
      case 'week': return 'Week';
      case 'week-no-weekend': return 'Work Week';
      default: return 'Today';
    }
  };
  
  const getColumnDateLabel = (dayOffset: number) => {
    const date = addDays(currentDate, dayOffset);
    return format(date, 'EEE, dd.MM.'); // German short date format
  };
  
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = START_HOUR; hour < END_HOUR; hour++) {
      slots.push(
        <div key={`time-${hour}`} className="time-slot flex items-start justify-end pr-2 text-xs text-allo-muted">
          <span className="mt-[-10px] mr-1">{`${hour.toString().padStart(2, '0')}:00`}</span>
        </div>
      );
    }
    return slots;
  };
  
  const generateCalendarGrid = () => {
    let numDays = 1;
    const today = new Date();
    const weekStart = startOfWeek(today);
    
    switch(viewMode) {
      case 'day':
        numDays = 1;
        break;
      case 'three-days':
        numDays = 3;
        break;
      case 'week':
        numDays = 7;
        break;
      case 'week-no-weekend':
        numDays = 5;
        break;
    }
    
    const weekNumber = getWeekNumber(today);
    const days = [];
    
    // Add week number for weekly views
    const showWeekNumber = viewMode === 'week' || viewMode === 'week-no-weekend';
    
    if (showWeekNumber) {
      days.push(
        <div key="week-number" className="col-span-full text-center mb-2 font-medium bg-gray-100 py-1 rounded-md">
          KW {weekNumber}
        </div>
      );
    }
    
    for (let dayOffset = 0; dayOffset < numDays; dayOffset++) {
      const dateForColumn = viewMode === 'day' ? today :
                          viewMode === 'three-days' ? addDays(today, dayOffset) :
                          addDays(weekStart, dayOffset);
      
      const headerCell = (
        <div key={`header-${dayOffset}`} className="text-center text-sm font-medium py-2 border-b border-gray-100">
          {getColumnDateLabel(viewMode === 'day' ? 0 : 
                             viewMode === 'three-days' ? dayOffset : 
                             dayOffset)}
        </div>
      );
      
      const dayCells = [];
      for (let hour = START_HOUR; hour < END_HOUR; hour++) {
        dayCells.push(
          <div key={`day-${dayOffset}-hour-${hour}`} className="time-slot relative">
            {/* Render meetings that fall within this time slot */}
            {meetings.filter(meeting => {
              const meetingDate = new Date(meeting.startTime);
              return isSameDay(meetingDate, dateForColumn) && 
                     meetingDate.getHours() >= START_HOUR && 
                     meetingDate.getHours() < END_HOUR;
            }).map(meeting => (
              <MeetingCard 
                key={meeting.id} 
                meeting={meeting} 
                isCalendarView={true}
                startHour={START_HOUR}
                endHour={END_HOUR}
              />
            ))}
          </div>
        );
      }
      
      days.push(
        <div key={`day-column-${dayOffset}`} className="flex flex-col flex-1">
          {headerCell}
          {dayCells}
        </div>
      );
    }
    
    return days;
  };
  
  return (
    <div className="w-full flex flex-col space-y-4 animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">My Meetings</h2>
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center">
                {getViewText()} <ChevronDown size={16} className="ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setViewMode('day')}>Today</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setViewMode('three-days')}>3 Days</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setViewMode('week-no-weekend')}>Work Week</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setViewMode('week')}>Full Week</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className={`calendar-grid ${viewMode} rounded-lg border border-gray-200 bg-white/90 overflow-auto`}>
        <div className="flex flex-col min-w-[60px]">
          <div className="h-10 border-b border-gray-100"></div>
          {generateTimeSlots()}
        </div>
        {generateCalendarGrid()}
      </div>
      
      <Button 
        className="allo-button mt-4 self-center"
        onClick={() => navigate('/add-meeting')}
      >
        <Plus size={16} className="mr-1" />
        Add New Meeting
      </Button>
    </div>
  );
};

export default CalendarView;
