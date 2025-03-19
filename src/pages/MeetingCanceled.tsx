
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Home, Calendar } from 'lucide-react';
import { Button } from "@/components/ui/button";

const MeetingCanceled: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { companyName, contactName } = location.state || {};
  
  const handleScheduleNew = () => {
    // Navigate to add meeting with prefilled company and contact
    navigate('/add-meeting', {
      state: {
        companyName,
        contactName
      }
    });
  };
  
  return (
    <div className="allo-page">
      <div className="allo-container">
        <div className="w-full max-w-md mx-auto text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="text-green-600" size={64} />
          </div>
          
          <h2 className="text-xl font-semibold mb-6">Meeting Canceled Successfully</h2>
          <p className="text-allo-muted mb-8">The meeting has been removed from your calendar.</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {(companyName || contactName) && (
              <Button 
                className="allo-button-secondary"
                onClick={handleScheduleNew}
              >
                <Calendar size={16} className="mr-1" />
                Schedule New Meeting
              </Button>
            )}
            
            <Button 
              className="allo-button"
              onClick={() => navigate('/')}
            >
              <Home size={16} className="mr-1" />
              Return to Homepage
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingCanceled;
