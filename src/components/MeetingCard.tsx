
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, Building2 } from 'lucide-react';

export interface Meeting {
  id: string;
  title: string;
  contactName: string;
  companyName: string;
  startTime: string;
  endTime: string;
  date: string;
  status?: 'scheduled' | 'completed' | 'canceled' | 'rescheduled';
}

interface MeetingCardProps {
  meeting: Meeting;
  isCalendarView?: boolean;
  startHour?: number;
  endHour?: number;
}

const MeetingCard: React.FC<MeetingCardProps> = ({ meeting, isCalendarView = false, startHour, endHour }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate(`/meeting/${meeting.id}`);
  };
  
  if (isCalendarView && startHour !== undefined && endHour !== undefined) {
    // Calculate position and size for calendar view
    const startDate = new Date(meeting.startTime);
    const endDate = new Date(meeting.endTime);
    
    const startHourMinutes = startDate.getHours() * 60 + startDate.getMinutes();
    const endHourMinutes = endDate.getHours() * 60 + endDate.getMinutes();
    
    const totalMinutes = (endHour - startHour) * 60;
    const startPercentage = ((startHourMinutes - startHour * 60) / totalMinutes) * 100;
    const durationPercentage = ((endHourMinutes - startHourMinutes) / totalMinutes) * 100;
    
    return (
      <div 
        className="meeting-card glassmorphism bg-blue-100/80 hover:bg-blue-100 cursor-pointer text-left transition-all duration-200"
        style={{ 
          top: `${startPercentage}%`, 
          height: `${durationPercentage}%`,
          minHeight: '40px',
          maxHeight: `${durationPercentage > 100 ? 100 : durationPercentage}%`
        }}
        onClick={handleClick}
      >
        <div className="p-2 flex flex-col h-full overflow-hidden">
          <div className="text-xs font-semibold truncate">{meeting.title}</div>
          <div className="text-xs text-allo-muted flex items-center gap-1 truncate">
            <User size={10} />
            <span className="truncate">{meeting.contactName}</span>
          </div>
          <div className="text-xs text-allo-muted flex items-center gap-1 truncate">
            <Building2 size={10} />
            <span className="truncate">{meeting.companyName}</span>
          </div>
        </div>
      </div>
    );
  }
  
  // Regular card view
  return (
    <div 
      className="allo-card hover-lift cursor-pointer" 
      onClick={handleClick}
    >
      <div className="flex flex-col space-y-2">
        <h3 className="font-medium">{meeting.title}</h3>
        <div className="flex justify-between text-sm text-allo-muted">
          <div className="flex items-center gap-1.5">
            <User size={14} />
            <span>{meeting.contactName}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Building2 size={14} />
            <span>{meeting.companyName}</span>
          </div>
        </div>
        <div className="flex justify-between text-xs text-allo-muted mt-2 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-1.5">
            <Calendar size={14} />
            <span>{meeting.date}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={14} />
            <span>{new Date(meeting.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingCard;
