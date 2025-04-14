import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Home } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import AudioRecorder from '@/components/AudioRecorder';
import ClosedLostReasonForm from '@/components/ClosedLostReasonForm';

const NegativeOutcome: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [step, setStep] = useState<'voice' | 'reason'>('voice');
  
  const handleAudioSend = (blob: Blob) => {
    setAudioBlob(blob);
    
    // In a real app, this would send the recording to Zapier via webhook
    console.log('Sending voice note to Zapier webhook');
    
    toast.success("Voice note recorded successfully");
    setStep('reason');
  };
  
  const handleComplete = () => {
    // In a real app, this would call the Hubspot API to mark the meeting as completed
    console.log(`Marking meeting ${id} as completed with negative outcome`);
    
    // Simulate API call success
    toast.success("Meeting marked as negative outcome");
    
    // Navigate to meetings page
    navigate('/dashboard');
  };
  
  return (
    <div className="allo-page">
      <div className="allo-container">
        <Button 
          variant="outline" 
          className="self-start mb-6"
          onClick={() => navigate('/dashboard')}
        >
          <ChevronLeft size={16} className="mr-1" />
          Back to Meetings
        </Button>
        
        <div className="w-full max-w-md mx-auto">
          <h2 className="text-xl font-semibold mb-8 text-center">Negative Outcome</h2>
          
          {step === 'voice' && (
            <div className="allo-card mb-6">
              <AudioRecorder onSend={handleAudioSend} />
            </div>
          )}
          
          {step === 'reason' && (
            <ClosedLostReasonForm 
              meetingId={id || ''}
              onComplete={handleComplete}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default NegativeOutcome;
