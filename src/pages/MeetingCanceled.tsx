
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Home } from 'lucide-react';
import { Button } from "@/components/ui/button";

const MeetingCanceled: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="allo-page">
      <div className="allo-container">
        <div className="w-full max-w-md mx-auto text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="text-green-600" size={64} />
          </div>
          
          <h2 className="text-xl font-semibold mb-6">Meeting Canceled Successfully</h2>
          <p className="text-allo-muted mb-8">The meeting has been removed from your calendar.</p>
          
          <Button 
            className="allo-button mt-4"
            onClick={() => navigate('/')}
          >
            <Home size={16} className="mr-1" />
            Return to Homepage
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MeetingCanceled;
