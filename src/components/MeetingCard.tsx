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

const MeetingCard: React.FC<MeetingCardProps> = ({ meeting, isCalendarView = false, startHour, endHour }) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const isCompleted = meeting.status === 'completed';
  const isPastScheduled = meeting.status === 'scheduled' && new Date(meeting.startTime) < new Date();
  
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
        icon = isPastScheduled ? 
          <div className="flex items-center">
            <span className="mr-1">Scheduled</span>
            {isMobile ? (
              <Popover>
                <PopoverTrigger>
                  <AlertTriangle size={isCalendarView ? 12 : 14} className="text-yellow-500" />
                </PopoverTrigger>
                <PopoverContent className="w-72 p-3">
                  <p className="text-sm">This meeting is scheduled but has already passed. Please update the meeting outcome.</p>
                </PopoverContent>
              </Popover>
            ) : (
              <HoverCard>
                <HoverCardTrigger>
                  <AlertTriangle size={isCalendarView ? 12 : 14} className="text-yellow-500" />
                </HoverCardTrigger>
                <HoverCardContent className="w-72 p-3">
                  <p className="text-sm">This meeting is scheduled but has already passed. Please update the meeting outcome.</p>
                </HoverCardContent>
              </HoverCard>
            )}
          </div> : 
          <ClockIcon size={isCalendarView ? 12 : 14} />;
        bgColor = isPastScheduled ? 'bg-yellow-100' : 'bg-blue-100';
        textColor = isPastScheduled ? 'text-yellow-800' : 'text-blue-800';
        
        // If isPastScheduled, the icon is already included in the div above
        if (isPastScheduled) {
          return (
            <div className={`flex items-center gap-1 text-xs rounded-full px-2 py-0.5 ${bgColor} ${textColor} whitespace-nowrap`}>
              {icon}
            </div>
          );
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
    // Calculate position and size for calendar view
    const startDate = new Date(meeting.startTime);
    const endDate = new Date(meeting.endTime);
    
    const startMinutes = startDate.getHours() * 60 + startDate.getMinutes();
    const endMinutes = endDate.getHours() * 60 + endDate.getMinutes();
    
    const totalMinutes = (endHour - startHour) * 60;
    const startPercentage = ((startMinutes - startHour * 60) / totalMinutes) * 100;
    const durationPercentage = ((endMinutes - startMinutes) / totalMinutes) * 100;
    
    const cardOpacity = isCompleted ? 'opacity-50' : (isPastScheduled ? 'opacity-60' : 'opacity-100');
    const cardCursor = isCompleted ? 'cursor-default' : 'cursor-pointer';
    const meetingBgColor = isPastScheduled ? 'bg-[#FF8769]/60' : 'bg-[#FF8769]/100';
    
    return (
      <div 
        className={`meeting-card ${meetingBgColor} hover:bg-[#FF8769]/90 transition-all duration-200 ${cardOpacity} ${cardCursor}`}
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
            {renderStatusBadge()}
          </div>
          <div className="mt-auto flex text-xs text-allo-muted justify-between items-end">
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
  
  // Regular card view
  return (
    <div 
      className={cn(
        "allo-card hover-lift",
        isCompleted ? "opacity-50 cursor-default" : "cursor-pointer"
      )} 
      onClick={handleClick}
    >
      <div className="flex flex-col space-y-2">
        <div className="flex justify-between items-start">
          <h3 className="font-medium">{meeting.title}</h3>
          {renderStatusBadge()}
        </div>
        {isPastScheduled && (
          <div className="bg-yellow-100 text-yellow-800 text-xs p-2 rounded">
            <div className="flex items-center gap-1">
              <AlertTriangle size={14} />
              <span>This meeting is in the past and needs attention</span>
            </div>
          </div>
        )}
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
