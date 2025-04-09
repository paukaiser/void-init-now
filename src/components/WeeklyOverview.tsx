
import React, { useMemo } from 'react';
import { 
  format, 
  startOfWeek, 
  addDays, 
  isSameDay,
  isSameMonth,
  isToday
} from 'date-fns';
import { cn } from '@/lib/utils';
import { Meeting } from './MeetingCard';
import { Task } from '@/types';

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
  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start on Monday
    return Array.from({ length: 7 }).map((_, i) => addDays(start, i));
  }, [currentDate]);

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

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <h2 className="text-xl font-semibold mb-3 text-center">
        {format(currentDate, 'MMMM yyyy')}
      </h2>
      
      <div className="grid grid-cols-7 gap-1 text-center">
        {weekDays.map((day, index) => {
          const dayMeetings = getMeetingsForDay(day);
          const dayTasks = getTasksForDay(day);
          const isSelected = isSameDay(day, currentDate);
          
          return (
            <button
              key={index}
              onClick={() => onDateSelect(day)}
              className={cn(
                "flex flex-col items-center py-2 rounded-lg relative",
                isSelected ? "bg-[#FF8769]/10" : "hover:bg-gray-100",
                !isSameMonth(day, currentDate) && "text-gray-400"
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
              <div className="flex gap-1 mt-1">
                {dayMeetings.length > 0 && (
                  <div className="w-2 h-2 rounded-full bg-[#FF8769]" title={`${dayMeetings.length} meetings`}></div>
                )}
                {dayTasks.length > 0 && (
                  <div className="w-2 h-2 rounded-full bg-[#2E1813]" title={`${dayTasks.length} tasks`}></div>
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
