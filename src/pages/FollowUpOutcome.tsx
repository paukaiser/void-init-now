
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Mic, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import AudioRecorder from '@/components/AudioRecorder';
import { toast } from "sonner";

const FollowUpOutcome: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [recordingComplete, setRecordingComplete] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  const handleAudioSend = (audioBlob: Blob) => {
    // In a real app, this would send the recording to Zapier via webhook
    console.log('Audio blob for follow-up:', audioBlob);
    setRecordingComplete(true);
  };
  
  const handleScheduleFollowUp = () => {
    // Navigate to add meeting page with meeting details for follow-up
    navigate('/add-meeting', {
      state: {
        isFollowUp: true,
        meetingId: id,
        // We'll add logic in AddMeeting to fetch meeting details if needed
      }
    });
  };
  
  const handleComplete = () => {
    // In a real app, this would call the Hubspot API to mark the meeting as completed
    console.log(`Marking meeting ${id} as completed with follow-up`);
    
    // Show confirmation screen
    setShowConfirmation(true);
  };
  
  if (showConfirmation) {
    return (
      <div className="allo-page">
        <div className="allo-container">
          <div className="w-full max-w-md mx-auto text-center">
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-green-100 p-4">
                <Check size={32} className="text-green-600" />
              </div>
            </div>
            
            <h2 className="text-2xl font-semibold mb-4">Meeting Completed</h2>
            <p className="mb-8">The meeting has been marked as completed successfully.</p>
            
            <Button 
              className="allo-button w-full"
              onClick={() => navigate('/')}
            >
              Return to Homepage
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
          onClick={() => navigate(`/meeting/${id}/outcome`)}
        >
          <ChevronLeft size={16} className="mr-1" />
          Back
        </Button>
        
        <div className="w-full max-w-md mx-auto">
          <h2 className="text-xl font-semibold mb-6 text-center">Follow-up</h2>
          
          <div className="space-y-6">
            <AudioRecorder onSend={handleAudioSend} />
            
            <div className="flex flex-col gap-4 mt-8">
              <Button 
                className="bg-blue-500 hover:bg-blue-600 text-white"
                onClick={handleScheduleFollowUp}
              >
                Schedule a Follow-up Meeting
              </Button>
              
              <Button 
                className="allo-button"
                onClick={handleComplete}
              >
                Complete
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FollowUpOutcome;
