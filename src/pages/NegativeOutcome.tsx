import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from "../components/ui/button.tsx";
import { toast } from "sonner";
import AudioRecorder from '../components/AudioRecorder.tsx';
import ClosedLostReasonForm from '../components/ClosedLostReasonForm.tsx';

const NegativeOutcome: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [step, setStep] = useState<'voice' | 'reason'>('voice');

  const handleAudioSend = async (blob: Blob) => {
    setAudioBlob(blob);

    // Build FormData for file upload
    const formData = new FormData();
    formData.append('audio', blob, 'voice-note.webm'); // Use the correct extension for your recorder

    try {
      // Send to your backend instead of Zapier!
      const response = await fetch('http://localhost:3000/api/meeting/send-voice', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to send audio to backend');
      toast.success("Voice note recorded and sent successfully");
      setStep('reason');
    } catch (err) {
      toast.error("Failed to send voice note");
      console.error("Backend error:", err);
    }
  };

  const handleComplete = () => {
    // In a real app, this would call the Hubspot API to mark the meeting as completed
    console.log(`Marking meeting ${id} as completed with negative outcome`);
    toast.success("Meeting marked as negative outcome");
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
