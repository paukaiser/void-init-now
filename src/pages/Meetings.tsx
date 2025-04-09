
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, CalendarPlus, ListPlus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import CalendarView from '@/components/CalendarView';
import WeeklyOverview from '@/components/WeeklyOverview';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Meetings: React.FC = () => {
  const navigate = useNavigate();
  const userId = "current-user"; // In a real app, you'd get this from auth context
  const [isFabExpanded, setIsFabExpanded] = useState(false);
  
  const handleFabClick = () => {
    setIsFabExpanded(!isFabExpanded);
  };
  
  const handleAddMeeting = () => {
    navigate('/add-meeting');
    setIsFabExpanded(false);
  };
  
  const handleAddTask = () => {
    navigate('/inbox');
    setIsFabExpanded(false);
  };
  
  return (
    <div className="w-full max-w-5xl mx-auto pb-20">
      {/* Weekly overview */}
      <WeeklyOverview />
      
      {/* Calendar view */}
      <div className="mt-4">
        <CalendarView userId={userId} />
      </div>
      
      {/* Floating Action Button */}
      <div className="fixed bottom-20 right-4 z-40 flex flex-col items-end space-y-2">
        {isFabExpanded && (
          <>
            <div 
              className="flex items-center bg-white shadow-lg rounded-full pr-2 pl-3 py-2 animate-slide-up"
              onClick={handleAddTask}
            >
              <span className="text-sm mr-2">New Task</span>
              <Button 
                size="icon" 
                className="h-10 w-10 rounded-full shadow-md bg-gray-800"
              >
                <ListPlus size={20} />
              </Button>
            </div>
            <div 
              className="flex items-center bg-white shadow-lg rounded-full pr-2 pl-3 py-2 animate-slide-up"
              onClick={handleAddMeeting}
            >
              <span className="text-sm mr-2">New Meeting</span>
              <Button 
                size="icon" 
                className="h-10 w-10 rounded-full shadow-md bg-orange-500"
              >
                <CalendarPlus size={20} />
              </Button>
            </div>
          </>
        )}
        <Button 
          size="icon" 
          className={`h-14 w-14 rounded-full shadow-lg ${isFabExpanded ? 'bg-gray-700 rotate-45' : 'bg-[#FF8769]'} transition-all duration-200`}
          onClick={handleFabClick}
        >
          <Plus size={24} />
        </Button>
      </div>
    </div>
  );
};

export default Meetings;
