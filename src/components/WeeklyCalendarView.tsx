
import React, { useState, useEffect } from 'react';
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  addDays,
  getHours,
  getMinutes,
  parseISO,
  isWithinInterval
} from 'date-fns';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';
import { Meeting } from './MeetingCard';

interface WeeklyCalendarViewProps {
  meetings: Meeting[];
  selectedDate: Date;
  onSelectMeeting?: (meeting: Meeting) => void;
}

const WeeklyCalendarView: React.FC<WeeklyCalendarViewProps> = ({ 
  meetings, 
  selectedDate,
  onSelectMeeting 
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const START_HOUR = 8;
  const END_HOUR = 22;
  
  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);
  
  // Get the week's days starting from Monday
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  
  // Get formatted time labels for the left sidebar
  const timeLabels = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);
  
  // Calculate meeting positions and dimensions
  const getMeetingStyle = (meeting: Meeting, dayIndex: number) => {
    const meetingStart = new Date(meeting.startTime);
    const meetingEnd = new Date(meeting.endTime);
    const meetingDay = new Date(meeting.startTime);
    
    const currentDay = weekDays[dayIndex];
    if (!isSameDay(meetingDay, currentDay)) return null;
    
    const startHour = getHours(meetingStart);
    const startMinute = getMinutes(meetingStart);
    const endHour = getHours(meetingEnd);
    const endMinute = getMinutes(meetingEnd);
    
    // Skip if outside our time range
    if (endHour < START_HOUR || startHour > END_HOUR) return null;
    
    const totalMinutesInView = (END_HOUR - START_HOUR) * 60;
    const startMinuteFromViewStart = Math.max(0, (startHour - START_HOUR) * 60 + startMinute);
    const endMinuteFromViewStart = Math.min(totalMinutesInView, (endHour - START_HOUR) * 60 + endMinute);
    
    const topPosition = (startMinuteFromViewStart / totalMinutesInView) * 100;
    const height = ((endMinuteFromViewStart - startMinuteFromViewStart) / totalMinutesInView) * 100;
    
    return {
      top: `${topPosition}%`,
      height: `${height}%`,
      minHeight: '25px',
      left: `${(dayIndex / 7) * 100}%`,
      width: `${100/7}%`,
    };
  };
  
  // Determine status-based colors for meetings
  const getMeetingClasses = (meeting: Meeting) => {
    if (meeting.status === 'completed') {
      return 'bg-green-200 border-green-300';
    } else if (meeting.status === 'canceled') {
      return 'bg-red-200 border-red-300';
    } else if (meeting.status === 'rescheduled') {
      return 'bg-yellow-200 border-yellow-300';
    }
    return 'bg-[#FF8769]/90 border-[#FF8769]';
  };
  
  // Get current time indicator position
  const getCurrentTimePosition = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    if (currentHour < START_HOUR || currentHour >= END_HOUR) return null;
    
    const totalMinutes = (END_HOUR - START_HOUR) * 60;
    const minutesSinceStart = (currentHour - START_HOUR) * 60 + currentMinute;
    
    return (minutesSinceStart / totalMinutes) * 100;
  };
  
  // Check if current time is within the displayed week
  const isCurrentTimeVisible = () => {
    const now = new Date();
    return isWithinInterval(now, { start: weekStart, end: weekEnd });
  };
  
  const currentTimePosition = getCurrentTimePosition();
  const isTodayVisible = isCurrentTimeVisible();
  const todayIndex = weekDays.findIndex(day => isSameDay(day, new Date()));
  
  return (
    <div className="w-full h-full flex flex-col animate-fade-in bg-white rounded-lg border border-gray-200">
      <div className="flex border-b border-gray-200">
        <div className="w-16 min-w-[60px] border-r border-gray-200"></div>
        {weekDays.map((day, i) => (
          <div 
            key={i}
            className={cn(
              "flex-1 p-2 text-center font-medium text-sm border-r border-gray-200",
              isSameDay(day, new Date()) && "bg-gray-50"
            )}
          >
            <div>{format(day, 'EEE')}</div>
            <div className={cn(
              "flex items-center justify-center rounded-full w-7 h-7 mx-auto",
              isSameDay(day, new Date()) && "bg-[#FF8769] text-white"
            )}>
              {format(day, 'd')}
            </div>
          </div>
        ))}
      </div>
      
      <ScrollArea className="flex-1">
        <div className="relative flex w-full">
          {/* Time column */}
          <div className="w-16 min-w-[60px] flex flex-col border-r border-gray-200">
            {timeLabels.map(hour => (
              <div 
                key={hour} 
                className="h-16 border-b border-gray-200 text-xs text-gray-500 relative"
              >
                <span className="absolute -top-2.5 right-2">
                  {`${hour.toString().padStart(2, '0')}:00`}
                </span>
              </div>
            ))}
          </div>
          
          {/* Days columns with grid */}
          <div className="flex flex-1 relative">
            {weekDays.map((day, dayIndex) => (
              <div 
                key={dayIndex} 
                className={cn(
                  "flex-1 border-r border-gray-200",
                  isSameDay(day, new Date()) && "bg-gray-50"
                )}
              >
                {timeLabels.map(hour => (
                  <div 
                    key={hour} 
                    className="h-16 border-b border-gray-200"
                  />
                ))}
                
                {/* Half hour lines */}
                {timeLabels.map(hour => (
                  <div 
                    key={`half-${hour}`}
                    className="absolute w-full border-t border-dashed border-gray-200 opacity-50"
                    style={{ 
                      top: `${((hour - START_HOUR) * 60 + 30) / ((END_HOUR - START_HOUR) * 60) * 100}%`,
                      left: `${(dayIndex / 7) * 100}%`,
                      width: `${100/7}%`
                    }}
                  />
                ))}
              </div>
            ))}
            
            {/* Current time indicator */}
            {isTodayVisible && currentTimePosition !== null && (
              <div 
                className="absolute h-0.5 bg-red-500 w-full z-10"
                style={{ top: `${currentTimePosition}%` }}
              >
                <div 
                  className="absolute h-3 w-3 bg-red-500 rounded-full -left-1.5 -top-1.5"
                  style={{ left: `${(todayIndex / 7) * 100}%` }}
                />
              </div>
            )}
            
            {/* Meetings */}
            {meetings.map(meeting => (
              weekDays.map((day, dayIndex) => {
                const style = getMeetingStyle(meeting, dayIndex);
                if (!style) return null;
                
                return (
                  <div 
                    key={`${meeting.id}-${dayIndex}`}
                    className={cn(
                      "absolute rounded-md border p-1 shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow",
                      getMeetingClasses(meeting)
                    )}
                    style={style}
                    onClick={() => onSelectMeeting && onSelectMeeting(meeting)}
                  >
                    <div className="text-xs font-medium truncate">{meeting.title}</div>
                    <div className="text-xs truncate opacity-80">
                      {format(new Date(meeting.startTime), 'HH:mm')} - {format(new Date(meeting.endTime), 'HH:mm')}
                    </div>
                    {style.height && parseInt(style.height) > 10 && (
                      <div className="text-xs truncate">{meeting.companyName}</div>
                    )}
                  </div>
                );
              })
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default WeeklyCalendarView;
