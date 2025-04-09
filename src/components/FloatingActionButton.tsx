
import React, { useState } from 'react';
import { Plus, X, Calendar, FileText } from 'lucide-react';
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
    <div className="fixed bottom-20 right-4 flex flex-col-reverse items-end space-y-reverse space-y-2 z-40">
      {/* Create Task option */}
      <div 
        className={cn(
          "flex items-center bg-[#2E1813] text-white rounded-full shadow-lg transition-all duration-200 transform",
          isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
        )}
      >
        <button 
          className="px-4 py-2 flex items-center space-x-2"
          onClick={handleCreateTask}
        >
          <FileText size={18} />
          <span>New Task</span>
        </button>
      </div>
      
      {/* Create Meeting option */}
      <div 
        className={cn(
          "flex items-center bg-[#FF8769] text-white rounded-full shadow-lg transition-all duration-200 transform",
          isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
        )}
      >
        <button 
          className="px-4 py-2 flex items-center space-x-2"
          onClick={handleCreateMeeting}
        >
          <Calendar size={18} />
          <span>New Meeting</span>
        </button>
      </div>
      
      {/* Main FAB */}
      <button 
        className={cn(
          "w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-transform duration-200",
          isOpen ? "bg-gray-200 rotate-45" : "bg-[#FF8769] hover:bg-[#FF8769]/90"
        )}
        onClick={toggleOptions}
      >
        {isOpen ? (
          <X size={24} className="text-gray-700" />
        ) : (
          <Plus size={24} className="text-white" />
        )}
      </button>
    </div>
  );
};

export default FloatingActionButton;
