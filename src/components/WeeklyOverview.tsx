
import React, { useMemo, useState, useRef } from 'react';
import { 
  format, 
  startOfWeek, 
  addDays, 
  isSameDay,
  isSameMonth,
  isToday,
  addWeeks,
  subWeeks
} from 'date-fns';
import { cn } from '@/lib/utils';
import { Meeting } from './MeetingCard';
import { Task } from '@/types';
import UserProfile from './UserProfile';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WeeklyOverviewProps {
  currentDate: Date;
  meetings: Meeting[];
  tasks: Task[];
  onDateSelect: (date: Date) => void;
}

const WeeklyOverview: React.FC<WeeklyOverviewProps> = ({
  currentDate,
  meetings,
  tasks,
  onDateSelect
}) => {
  const [weekOffset, setWeekOffset] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const displayedWeek = useMemo(() => {
    let baseDate = currentDate;
    if (weekOffset > 0) {
      baseDate = addWeeks(currentDate, weekOffset);
    } else if (weekOffset < 0) {
      baseDate = subWeeks(currentDate, Math.abs(weekOffset));
    }
    return baseDate;
  }, [currentDate, weekOffset]);

  const weekDays = useMemo(() => {
    const start = startOfWeek(displayedWeek, { weekStartsOn: 1 }); // Start on Monday
    return Array.from({ length: 7 }).map((_, i) => addDays(start, i));
  }, [displayedWeek]);

  const getMeetingsForDay = (date: Date) => {
    return meetings.filter(meeting => {
      const meetingDate = new Date(meeting.startTime);
      return isSameDay(meetingDate, date);
    });
  };

  const getTasksForDay = (date: Date) => {
    return tasks.filter(task => {
      const taskDate = new Date(task.createdAt);
      return isSameDay(taskDate, date);
    });
  };

  const goToPreviousWeek = () => {
    setWeekOffset(prev => prev - 1);
  };

  const goToNextWeek = () => {
    setWeekOffset(prev => prev + 1);
  };

  const goToToday = () => {
    setWeekOffset(0);
    onDateSelect(new Date());
  };

  const handleDayClick = (day: Date) => {
    onDateSelect(day);
    // Reset week offset when selecting a date
    setWeekOffset(0);
  };
  
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // Swipe left - go to next week
        goToNextWeek();
      } else {
        // Swipe right - go to previous week
        goToPreviousWeek();
      }
    }
    
    touchStartX.current = null;
  };

  // Check if current date is today
  const isCurrentDateToday = isToday(currentDate);
  // Check if any day in the current week is today
  const isTodayInCurrentWeek = weekDays.some(day => isToday(day));

  // Define the max dots to display before showing a plus sign
  const MAX_DOTS = 4;
  const MAX_DOTS_TOTAL = 8;

  return (
    <div 
      className="bg-white rounded-lg shadow-sm p-4 mb-4"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-semibold">
          {format(displayedWeek, 'MMMM')}
        </h2>
        <UserProfile small={true} />
      </div>
      
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-1 mr-2" 
            onClick={goToPreviousWeek}
            aria-label="Previous week"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          {/* Only show "Today" button when not on today's date */}
          {(!isCurrentDateToday || !isTodayInCurrentWeek) && (
            <button
              onClick={goToToday}
              className="flex items-center justify-center w-6 h-6 relative"
              aria-label="Go to today"
            >
              <Calendar className="h-5 w-5" />
            </button>
          )}
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-1 ml-2" 
            onClick={goToNextWeek}
            aria-label="Next week"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1 text-center">
        {weekDays.map((day, index) => {
          const dayMeetings = getMeetingsForDay(day);
          const dayTasks = getTasksForDay(day);
          const isSelected = isSameDay(day, currentDate);
          
          // Calculate how many dots to display
          const totalItems = dayMeetings.length + dayTasks.length;
          const showPlus = totalItems > MAX_DOTS_TOTAL;
          const dotSize = totalItems > MAX_DOTS ? "w-1.5 h-1.5" : "w-2 h-2";
          
          // Determine how many dots of each type to show
          let meetingDotsToShow = Math.min(dayMeetings.length, showPlus ? MAX_DOTS_TOTAL / 2 : MAX_DOTS);
          let taskDotsToShow = Math.min(dayTasks.length, showPlus ? (MAX_DOTS_TOTAL - meetingDotsToShow) : (MAX_DOTS - meetingDotsToShow));
          
          // If we have more of one type than the other, allow it to use more dots up to MAX_DOTS_TOTAL
          if (meetingDotsToShow < (showPlus ? MAX_DOTS_TOTAL / 2 : MAX_DOTS) && !showPlus) {
            taskDotsToShow = Math.min(dayTasks.length, MAX_DOTS_TOTAL - meetingDotsToShow);
          }
          if (taskDotsToShow < (showPlus ? MAX_DOTS_TOTAL / 2 : MAX_DOTS) && !showPlus) {
            meetingDotsToShow = Math.min(dayMeetings.length, MAX_DOTS_TOTAL - taskDotsToShow);
          }
          
          return (
            <button
              key={index}
              onClick={() => handleDayClick(day)}
              className={cn(
                "flex flex-col items-center py-2 rounded-lg relative",
                isSelected ? "bg-[#FF8769]/10" : "hover:bg-gray-100",
                !isSameMonth(day, displayedWeek) && "text-gray-400"
              )}
            >
              <span className="text-xs uppercase">
                {format(day, 'EEE')}
              </span>
              <span className={cn(
                "w-8 h-8 flex items-center justify-center rounded-full my-1",
                isToday(day) && "font-bold border border-[#FF8769]",
                isSelected && "bg-[#FF8769] text-white"
              )}>
                {format(day, 'd')}
              </span>
              
              {/* Dots for meetings and tasks */}
              <div className="flex gap-0.5 mt-1 items-center justify-center h-2">
                {/* Meeting dots (orange) */}
                {Array.from({ length: meetingDotsToShow }).map((_, i) => (
                  <div 
                    key={`meeting-${i}`} 
                    className={`${dotSize} rounded-full bg-[#FF8769]`} 
                    title={`${dayMeetings.length} meetings`}
                  />
                ))}
                
                {/* Task dots (black) */}
                {Array.from({ length: taskDotsToShow }).map((_, i) => (
                  <div 
                    key={`task-${i}`} 
                    className={`${dotSize} rounded-full bg-[#2E1813]`} 
                    title={`${dayTasks.length} tasks`}
                  />
                ))}
                
                {/* Plus indicator if there are more than MAX_DOTS_TOTAL total items */}
                {showPlus && (
                  <div className={`${dotSize} flex items-center justify-center ml-0.5 font-bold text-[8px] text-gray-600`} title={`${totalItems} total items`}>
                    +
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyOverview;
