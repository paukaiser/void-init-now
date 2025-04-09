
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
    const start = startOfWeek(displayedWeek, { weekStartsOn: 1 });
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

  const renderDayIndicators = (date: Date) => {
    const dayMeetings = getMeetingsForDay(date);
    const dayTasks = getTasksForDay(date);
    
    const meetingCount = dayMeetings.length;
    const taskCount = dayTasks.length;
    const totalCount = meetingCount + taskCount;
    
    if (totalCount === 0) return null;
    
    // Single row display logic
    const maxDotsBeforeShrink = 4;
    const maxTotalDots = 8;
    const showPlus = totalCount > maxTotalDots;
    
    // Calculate how many dots to show of each type
    // Prioritize meetings over tasks
    let dotsToShow = Math.min(totalCount, showPlus ? maxTotalDots - 1 : maxTotalDots);
    let meetingDots = Math.min(meetingCount, dotsToShow);
    let taskDots = Math.min(taskCount, dotsToShow - meetingDots);
    
    // Determine dot size based on total count
    const dotSize = totalCount > maxDotsBeforeShrink ? "w-1 h-1" : "w-1.5 h-1.5";
    
    return (
      <div className="flex justify-center mt-1 gap-[2px] max-w-[36px] mx-auto">
        {/* Meeting dots (orange) */}
        {Array.from({ length: meetingDots }).map((_, i) => (
          <div 
            key={`meeting-${i}`} 
            className={`${dotSize} rounded-full bg-[#FF8769]`} 
            title={`${meetingCount} meetings`}
          />
        ))}
        
        {/* Task dots (black) */}
        {Array.from({ length: taskDots }).map((_, i) => (
          <div 
            key={`task-${i}`} 
            className={`${dotSize} rounded-full bg-[#2E1813]`} 
            title={`${taskCount} tasks`}
          />
        ))}
        
        {/* Plus indicator if needed */}
        {showPlus && (
          <div 
            key="plus-indicator" 
            className={`${dotSize} flex items-center justify-center text-[8px] text-gray-600 font-semibold`} 
            title={`${totalCount - (maxTotalDots - 1)} more items`}
          >
            +
          </div>
        )}
      </div>
    );
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
        goToNextWeek();
      } else {
        goToPreviousWeek();
      }
    }
    
    touchStartX.current = null;
  };

  const isCurrentDateToday = isToday(currentDate);
  const isTodayInCurrentWeek = weekDays.some(day => isToday(day));

  // Create a more Google Calendar like Today button
  const renderTodayButton = () => {
    if (isCurrentDateToday && isTodayInCurrentWeek) return null;
    
    return (
      <button
        className="ml-2 flex items-center justify-center cursor-pointer group"
        onClick={goToToday}
        aria-label="Go to today"
        title="Today"
      >
        <div className="relative">
          <Calendar className="h-5 w-5 text-gray-600 group-hover:text-gray-800" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-[#FF8769]"></div>
          </div>
        </div>
      </button>
    );
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-sm p-4 mb-4"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex justify-between items-center mb-3">
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
          <h2 className="text-xl font-semibold">
            {format(displayedWeek, 'MMMM')}
          </h2>
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-1 ml-2" 
            onClick={goToNextWeek}
            aria-label="Next week"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
          
          {renderTodayButton()}
        </div>
        <UserProfile small={true} />
      </div>
      
      <div className="grid grid-cols-7 gap-1 text-center">
        {weekDays.map((day, index) => {
          const isSelected = isSameDay(day, currentDate);
          
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
              
              {renderDayIndicators(day)}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyOverview;
