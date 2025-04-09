
import React, { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, isToday, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { useTasks } from '@/hooks/useTasks';

const WeeklyOverview: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weekDays, setWeekDays] = useState<Date[]>([]);
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());
  const { tasks } = useTasks();
  
  // Mock meetings data - in a real app, this would come from an API or context
  const [meetings, setMeetings] = useState<{date: string, count: number}[]>([
    { date: format(new Date(), 'yyyy-MM-dd'), count: 2 },
    { date: format(addDays(new Date(), 1), 'yyyy-MM-dd'), count: 1 },
    { date: format(addDays(new Date(), 3), 'yyyy-MM-dd'), count: 3 },
  ]);
  
  useEffect(() => {
    // Generate the week days
    const startDay = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start from Monday
    const days = [];
    
    for (let i = 0; i < 7; i++) {
      days.push(addDays(startDay, i));
    }
    
    setWeekDays(days);
    
    // If no day is selected, select today or the first day of the week
    if (!selectedDay) {
      const today = new Date();
      const isCurrentWeek = days.some(day => isSameDay(day, today));
      setSelectedDay(isCurrentWeek ? today : days[0]);
    }
  }, [currentDate]);
  
  const getMeetingCount = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const meetingData = meetings.find(m => m.date === dateStr);
    return meetingData ? meetingData.count : 0;
  };
  
  const getTaskCount = (date: Date) => {
    // Filter tasks for the specific day
    const dateStr = format(date, 'dd.MM.yyyy');
    return tasks.filter(task => task.createdAt.includes(dateStr)).length;
  };
  
  return (
    <div className="bg-blue-600 text-white rounded-b-xl p-4 mx-auto w-full">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-semibold">{format(currentDate, 'MMMM')}</h2>
      </div>
      
      <div className="grid grid-cols-7 gap-1 text-center">
        {weekDays.map((day, index) => {
          const isSelected = isSameDay(day, selectedDay);
          const _isToday = isToday(day);
          const meetingCount = getMeetingCount(day);
          const taskCount = getTaskCount(day);
          
          return (
            <div 
              key={index} 
              className="flex flex-col items-center" 
              onClick={() => setSelectedDay(day)}
            >
              <div className="text-xs uppercase mb-1">
                {format(day, 'EEE')}
              </div>
              <div 
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center mb-1 text-sm font-medium cursor-pointer",
                  isSelected ? "bg-white text-blue-600" : "",
                  _isToday && !isSelected ? "border-2 border-white" : ""
                )}
              >
                {format(day, 'd')}
              </div>
              <div className="flex justify-center space-x-1 h-2">
                {meetingCount > 0 && (
                  <div className="flex">
                    {Array.from({ length: Math.min(meetingCount, 3) }).map((_, i) => (
                      <div key={`meeting-${i}`} className="w-1.5 h-1.5 rounded-full bg-orange-400 mx-0.5"></div>
                    ))}
                  </div>
                )}
                {taskCount > 0 && (
                  <div className="flex">
                    {Array.from({ length: Math.min(taskCount, 3) }).map((_, i) => (
                      <div key={`task-${i}`} className="w-1.5 h-1.5 rounded-full bg-gray-100 mx-0.5"></div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-2 text-center text-lg font-medium">
        {format(selectedDay, 'EEEE, MMMM d')}
      </div>
    </div>
  );
};

export default WeeklyOverview;
