import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, Building2, CheckCircle, XCircle, ClockIcon, RotateCw, AlertTriangle } from 'lucide-react';
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

export interface Meeting {
  id: string;
  title: string;
  contactName: string;
  companyName: string;
  startTime: string;
  endTime: string;
  date: string;
  type?: 'sales meeting' | 'sales followup';
  status?: 'scheduled' | 'completed' | 'canceled' | 'rescheduled';
}

interface MeetingCardProps {
  meeting: Meeting;
  isCalendarView?: boolean;
  startHour?: number;
  endHour?: number;
}

const getCardColor = (id: string) => {
  const colors = [
    'bg-purple-100 border-purple-300',
    'bg-red-100 border-red-300',
    'bg-yellow-100 border-yellow-300',
    'bg-green-100 border-green-300',
    'bg-blue-100 border-blue-300',
  ];
  
  const idSum = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[idSum % colors.length];
};

const MeetingCard: React.FC<MeetingCardProps> = ({ meeting, isCalendarView = false, startHour, endHour }) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const isCompleted = meeting.status === 'completed';
  const isPastScheduled = meeting.status === 'scheduled' && new Date(meeting.startTime) < new Date();
  
  const getDayOfWeek = (dateString: string) => {
    const [day, month, year] = dateString.split('.').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };
  
  const dayOfWeek = getDayOfWeek(meeting.date);
  
  const handleClick = () => {
    if (isCompleted) return; // Prevent clicking on completed meetings
    navigate(`/meeting/${meeting.id}`);
  };

  const renderStatusBadge = () => {
    const status = meeting.status || 'scheduled';
    let icon, bgColor, textColor;

    switch(status) {
      case 'completed':
        icon = <CheckCircle size={isCalendarView ? 12 : 14} />;
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
        break;
      case 'canceled':
        icon = <XCircle size={isCalendarView ? 12 : 14} />;
        bgColor = 'bg-red-100';
        textColor = 'text-red-800';
        break;
      case 'rescheduled':
        icon = <RotateCw size={isCalendarView ? 12 : 14} />;
        bgColor = 'bg-orange-100';
        textColor = 'text-orange-800';
        break;
      default: // scheduled
        if (isPastScheduled) {
          bgColor = 'bg-yellow-100';
          textColor = 'text-yellow-800';
          
          return (
            <div className={`flex items-center gap-1 text-xs rounded-full px-2 py-0.5 ${bgColor} ${textColor} whitespace-nowrap`}>
              {isMobile ? (
                <Popover>
                  <PopoverTrigger>
                    <AlertTriangle size={isCalendarView ? 12 : 14} className="text-[#FF6B00] mr-1" />
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-3">
                    <p className="text-sm">This meeting is scheduled but has already passed. Please update the meeting outcome.</p>
                  </PopoverContent>
                </Popover>
              ) : (
                <HoverCard>
                  <HoverCardTrigger>
                    <AlertTriangle size={isCalendarView ? 12 : 14} className="text-[#FF6B00] mr-1" />
                  </HoverCardTrigger>
                  <HoverCardContent className="w-72 p-3">
                    <p className="text-sm">This meeting is scheduled but has already passed. Please update the meeting outcome.</p>
                  </HoverCardContent>
                </HoverCard>
              )}
              <span>Scheduled</span>
            </div>
          );
        } else {
          icon = <ClockIcon size={isCalendarView ? 12 : 14} />;
          bgColor = 'bg-blue-100';
          textColor = 'text-blue-800';
        }
    }

    return (
      <div className={`flex items-center gap-1 text-xs rounded-full px-2 py-0.5 ${bgColor} ${textColor} whitespace-nowrap`}>
        {icon}
        <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
      </div>
    );
  };
  
  if (isCalendarView && startHour !== undefined && endHour !== undefined) {
    const startDate = new Date(meeting.startTime);
    const endDate = new Date(meeting.endTime);
    
    const startMinutes = startDate.getHours() * 60 + startDate.getMinutes();
    const endMinutes = endDate.getHours() * 60 + endDate.getMinutes();
    
    const totalMinutes = (endHour - startHour) * 60;
    const startPercentage = ((startMinutes - startHour * 60) / totalMinutes) * 100;
    const durationPercentage = ((endMinutes - startMinutes) / totalMinutes) * 100;
    
    const cardCursor = isCompleted ? 'cursor-default' : 'cursor-pointer';
    const meetingBgColor = 'bg-[#FF8769]/100';
    
    return (
      <div 
        className={`meeting-card ${meetingBgColor} hover:bg-[#FF8769]/90 transition-all duration-200 ${cardCursor}`}
        style={{ 
          top: `${startPercentage}%`, 
          height: `${durationPercentage}%`,
          minHeight: '40px',
          maxHeight: `${durationPercentage > 100 ? 100 : durationPercentage}%`
        }}
        onClick={handleClick}
      >
        <div className="p-2 flex flex-col h-full overflow-hidden">
          <div className="flex justify-between items-start mb-1">
            <div className="text-xs font-bold truncate">{meeting.title}</div>
            <div>
              {renderStatusBadge()}
            </div>
          </div>
          <div className="mt-auto text-xs text-allo-muted flex flex-wrap gap-2">
            <div className="flex items-center gap-1 truncate">
              <Building2 size={10} />
              <span className="truncate">{meeting.companyName}</span>
            </div>
            <div className="flex items-center gap-1 truncate">
              <User size={10} />
              <span className="truncate">{meeting.contactName}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  const cardColor = getCardColor(meeting.id);
  const startDate = new Date(meeting.startTime);
  const endDate = new Date(meeting.endTime);
  const startTime = startDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  const endTime = endDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  
  return (
    <div 
      className={`rounded-lg border ${cardColor} p-3 mb-2 shadow-sm ${isCompleted ? 'cursor-default' : 'cursor-pointer hover:shadow-md'} transition-shadow`} 
      onClick={handleClick}
    >
      <div className="flex justify-between items-start">
        <h3 className="font-medium text-base">{meeting.title}</h3>
        {renderStatusBadge()}
      </div>
      
      {isPastScheduled && (
        <div className="bg-yellow-100 text-yellow-800 text-xs p-2 rounded my-2">
          <div className="flex items-center gap-1">
            <AlertTriangle size={14} className="text-[#FF6B00]" />
            <span>This meeting has passed</span>
          </div>
        </div>
      )}
      
      <div className="flex items-center text-sm text-gray-600 mt-2">
        <Clock size={14} className="mr-1" />
        <span>{startTime} - {endTime}</span>
      </div>
      
      <div className="flex flex-col text-xs text-gray-500 mt-2">
        <div className="flex items-center">
          <Building2 size={12} className="mr-1" />
          <span>{meeting.companyName}</span>
        </div>
        <div className="flex items-center mt-1">
          <User size={12} className="mr-1" />
          <span>{meeting.contactName}</span>
        </div>
      </div>
    </div>
  );
};

export default MeetingCard;
