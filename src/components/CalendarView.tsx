
import React, { useState, useEffect, useRef } from 'react';
import { format, parseISO, startOfWeek, isToday, isSameDay } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from "@/components/ui/skeleton";
import MeetingCard, { Meeting } from './MeetingCard';

interface CalendarViewProps {
  userId: string;
}

const CalendarView: React.FC<CalendarViewProps> = ({ userId }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const navigate = useNavigate();
  
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
  
  const filteredMeetings = meetings.filter(meeting => {
    const meetingDate = new Date(meeting.startTime);
    return isSameDay(meetingDate, selectedDate);
  });
  
  if (loading) {
    return (
      <div className="space-y-3 px-4">
        <Skeleton className="h-20 w-full rounded-lg" />
        <Skeleton className="h-20 w-full rounded-lg" />
        <Skeleton className="h-20 w-full rounded-lg" />
      </div>
    );
  }
  
  const sortedMeetings = [...filteredMeetings].sort((a, b) => 
    new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );
  
  return (
    <div className="w-full flex flex-col space-y-4 px-4 animate-fade-in">
      {sortedMeetings.length > 0 ? (
        sortedMeetings.map(meeting => (
          <div key={meeting.id} onClick={() => navigate(`/meeting/${meeting.id}`)}>
            <MeetingCard meeting={meeting} />
          </div>
        ))
      ) : (
        <div className="text-center py-10 text-gray-500">
          <p>No meetings scheduled for this day</p>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
