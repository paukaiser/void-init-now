import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ArrowRight } from 'lucide-react';
import { Button } from "../components/ui/button.tsx";
import AudioRecorder from '../components/AudioRecorder.tsx';
import FileUploader from '../components/FileUploader.tsx';
import { toast } from "sonner";
import ClosedWonReasonForm from '../components/ClosedWonReasonForm.tsx';

const PositiveOutcome: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [step, setStep] = useState<'contract' | 'voice' | 'reason'>('contract');
  const [contractUploaded, setContractUploaded] = useState(false);
  
  const handleAudioSend = (audioBlob: Blob) => {
    // In a real app, you would upload the audio to your server
    console.log('Audio blob:', audioBlob);
    setStep('reason');
  };
  
  const handleFileUpload = async (file: File) => {
    // Step 1: POST file to your backend
    const formData = new FormData();
    formData.append('contract', file);
  
    try {
      const res = await fetch(`http://localhost:3000/api/meeting/${id}/upload-contract`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
  
      toast.success("Contract uploaded and attached to HubSpot deal");
      setContractUploaded(true);
    } catch (err) {
      toast.error("Failed to upload contract");
      console.error("Upload error:", err);
    }
  };
  
  
  const handleNextStep = () => {
    setStep('voice');
  };
  
  const handleComplete = () => {
    toast.success('Meeting updated with positive outcome');
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
          <h2 className="text-xl font-semibold mb-6 text-center">Positive Outcome</h2>
          
          {step === 'contract' && (
            <div className="space-y-6">
              <FileUploader 
                onUpload={handleFileUpload} 
                title="Upload Signed Contract"
              />
              
              <Button 
                className="allo-button w-full mt-6"
                onClick={handleNextStep}
                disabled={!contractUploaded}
              >
                Next Step
                <ArrowRight size={16} className="ml-1" />
              </Button>
            </div>
          )}
          
          {step === 'voice' && (
            <div className="space-y-6">
              <AudioRecorder onSend={handleAudioSend} />
            </div>
          )}
          
          {step === 'reason' && (
            <ClosedWonReasonForm 
              meetingId={id || ''}
              onComplete={handleComplete}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PositiveOutcome;
