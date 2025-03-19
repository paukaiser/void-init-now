
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import AudioRecorder from '@/components/AudioRecorder';
import { useToast } from "@/components/ui/use-toast";

const NegativeOutcome: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleAudioSend = (audioBlob: Blob) => {
    // In a real app, you would upload the audio to your server
    console.log('Audio blob:', audioBlob);
  };
  
  const handleComplete = () => {
    toast({
      title: 'Meeting Updated',
      description: 'The meeting has been marked as completed with a negative outcome.',
    });
    navigate('/meetings');
  };
  
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
          <h2 className="text-xl font-semibold mb-6 text-center">Negative Outcome</h2>
          
          <div className="space-y-6">
            <AudioRecorder onSend={handleAudioSend} />
            
            <Button 
              className="allo-button w-full mt-6"
              onClick={handleComplete}
            >
              Complete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NegativeOutcome;
