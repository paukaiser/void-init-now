
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useMeetingContext } from '../context/MeetingContext';
import { Calendar, Calendar as CalendarIcon, GripHorizontal } from 'lucide-react';
import { Meeting } from './MeetingCard';
import CalendarView from './CalendarView';
import WeeklyCalendarView from './WeeklyCalendarView';

interface MeetingSectionProps {
  userId: string;
  selectedDate?: Date;
  onSelectMeeting?: (meeting: Meeting) => void;
  onFetchedMeetings?: (meetings: Meeting[]) => void;
}

const MeetingSection: React.FC<MeetingSectionProps> = ({
  userId,
  selectedDate = new Date(),
  onSelectMeeting,
  onFetchedMeetings
}) => {
  const { meetings } = useMeetingContext();
  const [view, setView] = useState<'day' | 'week'>('day');

  return (
    <div className="flex-1 overflow-hidden p-2">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium">
          {meetings.length > 0
            ? `${meetings.length} meeting${meetings.length === 1 ? '' : 's'}`
            : 'No meetings scheduled'}
        </div>

        <Tabs value={view} onValueChange={(v) => setView(v as 'day' | 'week')} className="w-auto">
          <TabsList className="grid w-[180px] grid-cols-2">
            <TabsTrigger value="day" className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>Daily</span>
            </TabsTrigger>
            <TabsTrigger value="week" className="flex items-center">
              <GripHorizontal className="h-4 w-4 mr-1" />
              <span>Weekly</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="h-[calc(100vh-372px)] min-h-[300px] pb-2">
        <TabsContent value="day" className="h-full mt-0">
          <CalendarView 
            userId={userId} 
            selectedDate={selectedDate} 
            onSelectMeeting={onSelectMeeting}
          />
        </TabsContent>
        
        <TabsContent value="week" className="h-full mt-0">
          <WeeklyCalendarView 
            meetings={meetings} 
            selectedDate={selectedDate}
            onSelectMeeting={onSelectMeeting}
          />
        </TabsContent>
      </div>
    </div>
  );
};

export default MeetingSection;
