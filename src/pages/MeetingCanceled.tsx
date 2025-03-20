
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Check, Home, Calendar } from 'lucide-react';
import { Button } from "@/components/ui/button";

const MeetingCanceled: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [meetingDetails, setMeetingDetails] = useState<any>(null);
  
  useEffect(() => {
    // In a real app, this would fetch the meeting details from the state or API
    if (location.state && location.state.meetingDetails) {
      setMeetingDetails(location.state.meetingDetails);
    }
  }, [location]);
  
  const handleScheduleNewMeeting = () => {
    if (meetingDetails) {
      // Navigate to add meeting page with company and contact details pre-filled
      navigate('/add-meeting', {
        state: {
          companyId: meetingDetails.companyId,
          companyName: meetingDetails.companyName,
          companyAddress: meetingDetails.companyAddress,
          contactId: meetingDetails.contactId,
          contactName: meetingDetails.contactName
        }
      });
    } else {
      navigate('/add-meeting');
    }
  };
  
  return (
    <div className="allo-page">
      <div className="allo-container">
        <div className="w-full max-w-md mx-auto text-center">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-green-100 p-4">
              <Check size={32} className="text-green-600" />
            </div>
          </div>
          
          <h2 className="text-2xl font-semibold mb-4">Meeting Canceled</h2>
          <p className="mb-8">The meeting has been canceled successfully.</p>
          
          <div className="grid grid-cols-1 gap-4">
            <Button 
              className="allo-button"
              onClick={handleScheduleNewMeeting}
            >
              <Calendar size={16} className="mr-2" />
              Schedule New Meeting
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => navigate('/')}
            >
              <Home size={16} className="mr-2" />
              Go to Homepage
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingCanceled;
