import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, ArrowRight } from 'lucide-react';
import { Button } from "../components/ui/button.tsx";
import AudioRecorder from '../components/AudioRecorder.tsx';
import FileUploader from '../components/FileUploader.tsx';
import { toast } from "sonner";
import ClosedWonReasonForm from '../components/ClosedWonReasonForm.tsx';
import { useMeetingContext } from '../context/MeetingContext.tsx';

const PositiveOutcome: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Try navigation state
  const navDealId = location.state?.dealId;
  // 2. Try context
  const { meetings } = useMeetingContext?.() || { meetings: [] };
  const contextDealId = meetings.find(m => m.id === id)?.dealId;

  // 3. Local state, preferring nav > context
  const [dealId, setDealId] = useState<string | null>(navDealId || contextDealId || null);
  const [loadingDealId, setLoadingDealId] = useState<boolean>(!dealId);

  // Only fetch if missing from nav/context
  useEffect(() => {
    if (!dealId && id) {
      const fetchDealId = async () => {
        setLoadingDealId(true);
        try {
          const res = await fetch(`http://localhost:3000/api/meeting/${id}/deal`, {
            credentials: "include",
          });
          if (!res.ok) throw new Error("Failed to fetch dealId");
          const data = await res.json();
          if (data.dealId) setDealId(data.dealId);
          else setDealId(null);
        } catch (err) {
          toast.error("Could not find associated deal.");
          setDealId(null);
        } finally {
          setLoadingDealId(false);
        }
      };
      fetchDealId();
    }
  }, [id, dealId]);

  const [step, setStep] = useState<'contract' | 'voice' | 'reason'>('contract');
  const [contractUploaded, setContractUploaded] = useState(false);

  const handleAudioSend = (audioBlob: Blob) => {
    // In a real app, you would upload the audio to your server
    console.log('Audio blob:', audioBlob);
    setStep('reason');
  };

  const handleFileUpload = async (file: File) => {
    if (!dealId) {
      toast.error("Cannot upload: Deal not found.");
      return;
    }

    const formData = new FormData();
    formData.append('contract', file, file.name);
    formData.append('dealId', dealId);

    try {
      const res = await fetch(`http://localhost:3000/api/meeting/${id}/upload-contract`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload contract');
      toast.success("Contract uploaded and attached to the deal!");
      setContractUploaded(true);
    } catch (err) {
      toast.error("Failed to upload contract");
      console.error(err);
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
          
          {step === 'contract' && loadingDealId && (
            <div className="p-4 text-center">Loading deal info…</div>
          )}

          {step === 'contract' && !loadingDealId && !dealId && (
            <div className="text-red-500 p-4 text-center">
              No associated deal found for this meeting.
            </div>
          )}

          {step === 'contract' && !loadingDealId && dealId && (
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
