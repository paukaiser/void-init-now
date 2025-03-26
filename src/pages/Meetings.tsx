
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import CalendarView from '@/components/CalendarView';

const Meetings: React.FC = () => {
  const navigate = useNavigate();
  const userId = "current-user"; // In a real app, you'd get this from auth context
  
  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">My Meetings</h2>
        <Button 
          className="allo-button"
          onClick={() => navigate('/add-meeting')}
        >
          <Plus size={16} className="mr-1" />
          Add Meeting
        </Button>
      </div>
      
      <CalendarView userId={userId} />
    </div>
  );
};

export default Meetings;
