
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ThumbsUp, ThumbsDown, Clock } from 'lucide-react';
import { Button } from "@/components/ui/button";

const MeetingOutcome: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const handleOutcome = (outcome: 'positive' | 'negative' | 'follow-up') => {
    // In a real app, this would call the Hubspot API to update the meeting outcome
    
    if (outcome === 'positive') {
      navigate(`/meeting/${id}/positive`);
    } else if (outcome === 'negative') {
      navigate(`/meeting/${id}/negative`);
    } else if (outcome === 'follow-up') {
      // This would be where we'd send the API update to Hubspot
      // For follow-up, we navigate to the add meeting page with prefilled data
      navigate('/add-meeting', {
        state: {
          isFollowUp: true,
          meetingId: id,
          // We'll add logic in AddMeeting to fetch meeting details if needed
        }
      });
    }
  };
  
  return (
    <div className="allo-page">
      <div className="allo-container">
        <Button 
          variant="outline" 
          className="self-start mb-6"
          onClick={() => navigate(`/meeting/${id}`)}
        >
          <ChevronLeft size={16} className="mr-1" />
          Back
        </Button>
        
        <div className="w-full max-w-md mx-auto">
          <h2 className="text-xl font-semibold mb-8 text-center">Meeting Outcome</h2>
          
          <div className="grid grid-cols-1 gap-4">
            <Button 
              className="flex items-center justify-center py-6 bg-green-600 hover:bg-green-700 text-white"
              onClick={() => handleOutcome('positive')}
            >
              <ThumbsUp size={18} className="mr-2" />
              Positive
            </Button>
            
            <Button 
              className="flex items-center justify-center py-6 bg-red-600 hover:bg-red-700 text-white"
              onClick={() => handleOutcome('negative')}
            >
              <ThumbsDown size={18} className="mr-2" />
              Negative
            </Button>
            
            <Button 
              className="flex items-center justify-center py-6 bg-blue-500 hover:bg-blue-600 text-white"
              onClick={() => handleOutcome('follow-up')}
            >
              <Clock size={18} className="mr-2" />
              Follow-up
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingOutcome;
