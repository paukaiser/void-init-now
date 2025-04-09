
import React, { useState } from 'react';
import { Plus, Calendar, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface FloatingActionButtonProps {
  onCreateTask?: () => void;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onCreateTask }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleOptions = () => {
    setIsOpen(!isOpen);
  };

  const handleCreateMeeting = () => {
    setIsOpen(false);
    navigate('/add-meeting');
  };

  const handleCreateTask = () => {
    setIsOpen(false);
    if (onCreateTask) {
      onCreateTask();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 flex flex-col-reverse items-end space-y-reverse space-y-4 z-40">
      {/* Meeting option - now on bottom */}
      <div className="flex items-center flex-row-reverse">
        <button 
          className={cn(
            "rounded-full shadow-lg flex items-center justify-center transition-all duration-200 w-14 h-14",
            isOpen ? "bg-[#2E1813]" : "bg-[#FF8769] hover:bg-[#FF8769]/90"
          )}
          onClick={isOpen ? handleCreateMeeting : toggleOptions}
          aria-label={isOpen ? "Create Meeting" : "Open Menu"}
        >
          {isOpen ? (
            <Calendar size={24} className="text-white" />
          ) : (
            <Plus size={24} className="text-white" />
          )}
        </button>
        {isOpen && (
          <span className="mr-2 bg-white/80 backdrop-blur-sm px-2 py-1 rounded text-[#2E1813] text-sm shadow-sm">
            Meeting
          </span>
        )}
      </div>
      
      {/* Task option - now on top */}
      <div 
        className={cn(
          "transition-all duration-200 transform flex items-center flex-row-reverse",
          isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
        )}
      >
        <button 
          className="bg-[#2E1813] text-white rounded-full shadow-lg w-12 h-12 flex items-center justify-center"
          onClick={handleCreateTask}
          aria-label="Create Task"
        >
          <FileText size={20} />
        </button>
        <span className="mr-2 bg-white/80 backdrop-blur-sm px-2 py-1 rounded text-[#2E1813] text-sm shadow-sm">
          Task
        </span>
      </div>
    </div>
  );
};

export default FloatingActionButton;
