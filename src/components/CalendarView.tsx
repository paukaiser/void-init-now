import React, { useState, useEffect, useRef } from 'react';
import {
  format,
  isSameDay,
  parseISO,
  startOfWeek,
  endOfWeek,
  addWeeks,
  getTime
} from 'date-fns';
import MeetingCard, { Meeting } from "./MeetingCard.tsx";
import { ScrollArea } from './ui/scroll-area.tsx';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog.tsx";
import { AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMeetingContext } from '../context/MeetingContext.tsx';


interface CalendarViewProps {
  userId: string;
  selectedDate?: Date;
  onSelectMeeting?: (meeting: Meeting) => void;
  onFetchedMeetings?: (meetings: Meeting[]) => void; // ← add this
}


const CalendarView: React.FC<CalendarViewProps> = ({ userId, selectedDate, onSelectMeeting}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { setMeetings, meetings } = useMeetingContext();
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [meetingToCancel, setMeetingToCancel] = useState<Meeting | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const START_HOUR = 8;
  const END_HOUR = 22;

  useEffect(() => {
    if (selectedDate) {
      setCurrentDate(selectedDate);
    }
  }, [selectedDate]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchMeetings = async () => {
      const startTime = getTime(startOfWeek(new Date(), { weekStartsOn: 1 }));
      const endTime = getTime(endOfWeek(addWeeks(new Date(), 1), { weekStartsOn: 1 }));

      if (!userId) {
        console.warn("⚠️ Skipping fetch: userId is undefined");
        return;
      }

      console.log("📤 Fetching meetings for userId:", userId);

      setLoading(true);
      try {
        const res = await fetch('http://localhost:3000/api/meetings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ ownerId: userId, startTime, endTime })
        });

        if (!res.ok) {
          const errorText = await res.text();
          console.error("❌ Backend error:", errorText);
          return;
        }

        const data = await res.json();
        const hubspotMeetings = (data.results || []).map((item: any) => ({
          id: item.id,
          title: item.title,
          contactName: item.contactName,
          companyName: item.companyName,
          startTime: item.startTime,
          endTime: item.endTime,
          date: item.date,
          type: item.type,
          status: item.status,
          address: item.address,
          dealId: item.dealId
        }));

        setMeetings(hubspotMeetings);
      } catch (err) {
        console.error("❌ Failed to fetch HubSpot meetings", err);
      }


      setLoading(false);
    };

    fetchMeetings();
  }, [userId, currentDate]);

  const timeToY = (time: Date): number => {
    const hours = time.getHours();
    const minutes = time.getMinutes();

    if (hours < START_HOUR || hours >= END_HOUR) return -1;

    const totalMinutes = (END_HOUR - START_HOUR) * 60;
    const minutesSinceStart = (hours - START_HOUR) * 60 + minutes;

    return (minutesSinceStart / totalMinutes) * 100;
  };

  const generateTimeSlots = () =>
    Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i).map(hour => (
      <div key={`time-${hour}`} className="time-slot flex items-start justify-end pr-2 text-xs text-muted-foreground">
        <span className="mt-[-10px] mr-1">{`${hour.toString().padStart(2, '0')}:00`}</span>
      </div>
    ));

  const generateCalendarGrid = () => {
    const grid: React.ReactNode[] = [];
    const currentTimePosition = timeToY(currentTime);

    for (let hour = START_HOUR; hour <= END_HOUR; hour++) {
      grid.push(
        <div
          key={`hour-line-${hour}`}
          className="hour-grid-line"
          style={{ top: `${((hour - START_HOUR) * 60) / ((END_HOUR - START_HOUR) * 60) * 100}%` }}
        />
      );

      if (hour < END_HOUR) {
        grid.push(
          <div
            key={`half-hour-line-${hour}`}
            className="minute-grid-line"
            style={{ top: `${((hour - START_HOUR) * 60 + 30) / ((END_HOUR - START_HOUR) * 60) * 100}%` }}
          />
        );
      }
    }

    if (isSameDay(currentDate, new Date()) && currentTimePosition > 0 && currentTimePosition < 100) {
      grid.push(
        <div
          key="current-time-indicator"
          className="current-time-indicator"
          style={{ top: `${currentTimePosition}%` }}
        />
      );
    }

    meetings
      .filter(meeting => isSameDay(new Date(meeting.startTime), currentDate))
      .forEach(meeting => {
        grid.push(
          <MeetingCard
          key={meeting.id}
          meeting={meeting}
          isCalendarView
          startHour={START_HOUR}
          endHour={END_HOUR}
          onCancel={() => setMeetingToCancel(meeting)}
          onSelect={onSelectMeeting}
          />
        );
      });

    return grid;
  };

  return (
    <div className="w-full h-full flex flex-col animate-fade-in">
      <ScrollArea className="flex-grow h-full">
        <div className="calendar-grid daily-view rounded-lg border border-gray-200 bg-white/90 h-full relative">
          <div className="flex flex-col min-w-[60px]">
            <div className="h-10 border-b border-gray-100" />
            {generateTimeSlots()}
          </div>
          <div className="flex flex-col flex-1 relative">
            <div className="text-center text-sm font-medium py-2 border-b border-gray-100 invisible">Spacer</div>
            <div className="flex-1 relative" ref={calendarRef}>
              {generateCalendarGrid()}
            </div>
          </div>
        </div>
      </ScrollArea>

      <AlertDialog open={!!meetingToCancel} onOpenChange={(open) => !open && setMeetingToCancel(null)}>
        <AlertDialogContent className="max-w-[350px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <AlertTriangle className="text-red-500 mr-2 h-5 w-5" />
              Cancel Meeting
            </AlertDialogTitle>
            <AlertDialogDescription>
              {meetingToCancel && (
                <>Are you sure you want to cancel this meeting with {meetingToCancel.contactName} from {meetingToCancel.companyName}?</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, keep it</AlertDialogCancel>
            <AlertDialogAction onClick={() => navigate('/meeting-canceled')} className="bg-red-600 hover:bg-red-700">
              Yes, cancel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CalendarView;
