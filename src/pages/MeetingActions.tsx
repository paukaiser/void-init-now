
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Check, X, Clock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Meeting } from '@/components/MeetingCard';

const MeetingActions: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // In a real app, you would fetch the meeting from your API
    const fetchMeeting = async () => {
      setLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        setMeeting({
          id: id || '1',
          title: 'Product Demo',
          contactName: 'Sarah Chen',
          companyName: 'Acme Inc',
          startTime: new Date().toISOString(),
          endTime: new Date(new Date().getTime() + 3600000).toISOString(),
          date: new Date().toLocaleDateString(),
          status: 'scheduled'
        });
        setLoading(false);
      }, 800);
    };
    
    fetchMeeting();
  }, [id]);
  
  const handleAction = (action: 'completed' | 'canceled' | 'rescheduled') => {
    if (action === 'completed') {
      navigate(`/meeting/${id}/outcome`);
    } else if (action === 'canceled') {
      // In a real app, you would update the meeting status
      navigate('/meetings');
    } else if (action === 'rescheduled') {
      // In a real app, you would navigate to a reschedule screen
      navigate('/meetings');
    }
  };
  
  if (loading) {
    return (
      <div className="allo-page">
        <div className="allo-container">
          <div className="w-full h-40 flex items-center justify-center">
            <div className="animate-pulse-soft">Loading meeting information...</div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!meeting) {
    return (
      <div className="allo-page">
        <div className="allo-container">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Meeting Not Found</h2>
            <p className="text-allo-muted mb-6">The meeting you're looking for doesn't exist.</p>
            <Button
              onClick={() => navigate('/meetings')}
              variant="outline"
            >
              Back to Meetings
            </Button>
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
          className="self-start mb-6"
          onClick={() => navigate('/meetings')}
        >
          <ChevronLeft size={16} className="mr-1" />
          Back to Meetings
        </Button>
        
        <div className="w-full max-w-md mx-auto">
          <div className="allo-card mb-8">
            <h2 className="text-xl font-semibold">{meeting.title}</h2>
            <div className="mt-2 space-y-2 text-allo-muted">
              <p><span className="font-medium">Contact:</span> {meeting.contactName}</p>
              <p><span className="font-medium">Company:</span> {meeting.companyName}</p>
              <p><span className="font-medium">Date:</span> {meeting.date}</p>
              <p>
                <span className="font-medium">Time:</span> {' '}
                {new Date(meeting.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                {new Date(meeting.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </p>
            </div>
          </div>
          
          <h3 className="text-lg font-medium mb-4 text-center">Update Meeting Status</h3>
          
          <div className="grid grid-cols-1 gap-4">
            <Button 
              className="flex items-center justify-center py-6 bg-green-600 hover:bg-green-700 text-white"
              onClick={() => handleAction('completed')}
            >
              <Check size={18} className="mr-2" />
              Completed
            </Button>
            
            <Button 
              className="flex items-center justify-center py-6 bg-red-600 hover:bg-red-700 text-white"
              onClick={() => handleAction('canceled')}
            >
              <X size={18} className="mr-2" />
              Canceled
            </Button>
            
            <Button 
              className="flex items-center justify-center py-6 bg-orange-500 hover:bg-orange-600 text-white"
              onClick={() => handleAction('rescheduled')}
            >
              <Clock size={18} className="mr-2" />
              Rescheduled
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingActions;
