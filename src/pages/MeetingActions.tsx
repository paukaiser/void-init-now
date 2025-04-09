
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Check, X, Clock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

const MeetingActions: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // In a real app, you would fetch meeting details from Hubspot API
  // For now, we'll use mock data
  const meetingDetails = {
    id: id || '1',
    title: 'Product Demo',
    contactName: 'Sarah Chen',
    companyName: 'Acme Inc',
    companyId: 'acme-123',
    companyAddress: '123 Main St, San Francisco, CA',
    contactId: 'sarah-456',
    startTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
    endTime: new Date(Date.now() + 7200000).toISOString(),   // 2 hours from now
    date: '12.06.2024',
    status: 'scheduled',
    meetingType: 'sales meeting'
  };
  
  const handleCancel = () => {
    // Pass meeting details to the canceled page
    navigate('/meeting-canceled', {
      state: {
        meetingDetails: {
          companyId: meetingDetails.companyId,
          companyName: meetingDetails.companyName,
          companyAddress: meetingDetails.companyAddress,
          contactId: meetingDetails.contactId,
          contactName: meetingDetails.contactName
        }
      }
    });
  };
  
  const handleComplete = () => {
    // Navigate to meeting outcome page
    navigate(`/meeting/${id}/outcome`);
  };
  
  const handleReschedule = () => {
    // Navigate to add meeting page with rescheduling data
    // Only pass the necessary details for rescheduling
    navigate('/add-meeting', { 
      state: { 
        isRescheduling: true,
        meetingId: id,
        title: meetingDetails.title,
        companyName: meetingDetails.companyName,
        companyId: meetingDetails.companyId,
        companyAddress: meetingDetails.companyAddress,
        contactId: meetingDetails.contactId,
        contactName: meetingDetails.contactName,
        meetingType: meetingDetails.meetingType,
        forceCompany: true // Force company selection to be disabled
      } 
    });
  };

  return (
    <div className="allo-page">
      <div className="allo-container">
        <Button 
          variant="outline" 
          className="self-start mb-6"
          onClick={() => navigate('/meetings')}
        >
          <ChevronLeft size={16} className="mr-1" />
          Back to Meetings
        </Button>
        
        <div className="allo-card w-full max-w-md mx-auto">
          <h2 className="text-xl font-semibold mb-2">{meetingDetails.title}</h2>
          
          <div className="py-2">
            <p className="text-sm text-gray-500">Contact</p>
            <p className="font-medium">{meetingDetails.contactName}</p>
          </div>
          
          <div className="py-2">
            <p className="text-sm text-gray-500">Company</p>
            <p className="font-medium">{meetingDetails.companyName}</p>
          </div>
          
          <div className="py-2">
            <p className="text-sm text-gray-500">Date &amp; Time</p>
            <p className="font-medium">{meetingDetails.date} • {new Date(meetingDetails.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(meetingDetails.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
          </div>
          
          <div className="py-2">
            <p className="text-sm text-gray-500">Status</p>
            <p className="font-medium capitalize">{meetingDetails.status}</p>
          </div>
          
          <div className={`mt-6 ${isMobile ? 'flex flex-col space-y-3' : 'grid grid-cols-3 gap-3'}`}>
            <Button 
              className="flex items-center justify-center py-2 bg-red-600 hover:bg-red-700 text-white"
              onClick={handleCancel}
            >
              <X size={16} className="mr-1" />
              Cancel
            </Button>
            
            <Button 
              className="flex items-center justify-center py-2 bg-amber-500 hover:bg-amber-600 text-white"
              onClick={handleReschedule}
            >
              <Clock size={16} className="mr-1" />
              Reschedule
            </Button>
            
            <Button 
              className="flex items-center justify-center py-2 bg-green-600 hover:bg-green-700 text-white"
              onClick={handleComplete}
            >
              <Check size={16} className="mr-1" />
              Complete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingActions;
