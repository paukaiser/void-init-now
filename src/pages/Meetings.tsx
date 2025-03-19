
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import CalendarView from '@/components/CalendarView';

const Meetings: React.FC = () => {
  const navigate = useNavigate();
  const userId = "current-user"; // In a real app, you'd get this from auth context
  
  return (
    <div className="allo-page">
      <div className="w-full max-w-5xl mx-auto py-4">
        <Button 
          variant="outline" 
          className="mb-6"
          onClick={() => navigate('/')}
        >
          <ChevronLeft size={16} className="mr-1" />
          Back to Home
        </Button>
        
        <CalendarView userId={userId} />
      </div>
    </div>
  );
};

export default Meetings;
