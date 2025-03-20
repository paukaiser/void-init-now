
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Calendar, Clock, Building, User, CheckCircle, XCircle, MoreHorizontal } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

interface Meeting {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  companyId: string;
  companyName: string;
  companyAddress: string;
  contactId: string;
  contactName: string;
  status: 'scheduled' | 'completed' | 'canceled' | 'rescheduled';
  type: 'sales meeting' | 'sales followup';
}

const MeetingActions: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  
  useEffect(() => {
    const fetchMeeting = async () => {
      setLoading(true);
      
      // In a real app, this would fetch the meeting from Hubspot API
      // For now, we'll simulate a response
      setTimeout(() => {
        const mockMeeting: Meeting = {
          id: id || '1',
          title: 'Product Demo',
          date: '15.05.2023',
          startTime: '09:00',
          endTime: '10:00',
          companyId: '1',
          companyName: 'Acme Inc',
          companyAddress: '123 Main St, San Francisco, CA 94105',
          contactId: '1',
          contactName: 'Sarah Chen',
          status: 'scheduled',
          type: 'sales meeting'
        };
        
        setMeeting(mockMeeting);
        setLoading(false);
      }, 500);
    };
    
    fetchMeeting();
  }, [id]);
  
  const handleMarkComplete = () => {
    navigate(`/meeting/${id}/outcome`);
  };
  
  const handleReschedule = () => {
    if (meeting) {
      navigate('/add-meeting', {
        state: {
          isRescheduling: true,
          meetingId: meeting.id,
          title: meeting.title,
          meetingType: meeting.type,
          companyName: meeting.companyName,
          contactName: meeting.contactName,
        }
      });
    }
  };
  
  const handleCancelConfirm = () => {
    // In a real app, this would call the Hubspot API to update the meeting status
    
    toast.success("Meeting canceled successfully");
    setShowCancelDialog(false);
    
    // Navigate to the canceled confirmation page with meeting details
    navigate('/meeting-canceled', {
      state: {
        meetingDetails: meeting
      }
    });
  };
  
  if (loading) {
    return (
      <div className="allo-page">
        <div className="allo-container">
          <Skeleton className="h-8 w-40 mb-6" />
          <div className="allo-card animate-pulse">
            <Skeleton className="h-8 w-3/4 mb-6" />
            <div className="space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!meeting) {
    return (
      <div className="allo-page">
        <div className="allo-container">
          <div className="allo-card">
            <h2 className="text-xl font-semibold mb-4">Meeting not found</h2>
            <Button onClick={() => navigate('/meetings')}>Back to Meetings</Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="allo-page">
      <div className="allo-container">
        <Button 
          variant="outline" 
          className="mb-6"
          onClick={() => navigate('/meetings')}
        >
          Back to Meetings
        </Button>
        
        <div className="allo-card relative">
          <div className="absolute right-4 top-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal size={20} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleReschedule}>
                  Reschedule
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowCancelDialog(true)} className="text-red-600">
                  Cancel Meeting
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <h2 className="text-xl font-semibold mb-6 pr-10">{meeting.title}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="flex items-start">
              <Calendar size={20} className="mt-0.5 mr-3 text-gray-500" />
              <div>
                <p className="font-medium">Date</p>
                <p className="text-gray-600">{meeting.date}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Clock size={20} className="mt-0.5 mr-3 text-gray-500" />
              <div>
                <p className="font-medium">Time</p>
                <p className="text-gray-600">{meeting.startTime} - {meeting.endTime}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Building size={20} className="mt-0.5 mr-3 text-gray-500" />
              <div>
                <p className="font-medium">Company</p>
                <p className="text-gray-600">{meeting.companyName}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <User size={20} className="mt-0.5 mr-3 text-gray-500" />
              <div>
                <p className="font-medium">Contact</p>
                <p className="text-gray-600">{meeting.contactName}</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:justify-between gap-4 pt-4 border-t border-gray-200">
            <div>
              <p className="font-medium">Status</p>
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 bg-blue-100 text-blue-800">
                {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                onClick={() => setShowCancelDialog(true)}
              >
                <XCircle size={16} className="mr-1" />
                Cancel
              </Button>
              
              <Button 
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={handleMarkComplete}
              >
                <CheckCircle size={16} className="mr-1" />
                Complete
              </Button>
            </div>
          </div>
        </div>
        
        <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Cancel Meeting</DialogTitle>
            </DialogHeader>
            
            <p className="py-4">
              Are you sure you want to cancel this meeting? This action cannot be undone.
            </p>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
                No, Keep It
              </Button>
              <Button variant="destructive" onClick={handleCancelConfirm}>
                Yes, Cancel Meeting
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default MeetingActions;
