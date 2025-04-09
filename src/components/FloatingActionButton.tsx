
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Calendar, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface FloatingActionButtonProps {
  onCreateTask?: () => void;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onCreateTask }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const fabRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fabRef.current && !fabRef.current.contains(event.target as Node) && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <>
      {/* Overlay that darkens the screen when FAB is open */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-30"
          aria-hidden="true"
        />
      )}
      
      <div 
        ref={fabRef}
        className="fixed bottom-6 right-6 flex flex-col-reverse items-end space-y-reverse space-y-4 z-40"
      >
        {/* Task option - Shows ABOVE the main button when open */}
        <div 
          className={cn(
            "transition-all duration-200 transform flex items-center flex-row-reverse",
            isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
          )}
        >
          <button 
            className="bg-[#FF8769] text-white rounded-full shadow-lg w-12 h-12 flex items-center justify-center"
            onClick={handleCreateTask}
            aria-label="Create Task"
          >
            <FileText size={20} />
          </button>
          {isOpen && (
            <span className="mr-2 bg-white/80 backdrop-blur-sm px-2 py-1 rounded text-[#2E1813] text-sm shadow-sm">
              Task
            </span>
          )}
        </div>
        
        {/* Main FAB button - Changes to Calendar when open */}
        <div className="flex items-center flex-row-reverse">
          <button 
            className="bg-black hover:bg-black/90 text-[#FF8769] rounded-full shadow-lg w-14 h-14 flex items-center justify-center"
            onClick={toggleOptions}
            aria-label={isOpen ? "Close Menu" : "Open Menu"}
          >
            {isOpen ? (
              <Calendar size={24} />
            ) : (
              <Plus size={24} />
            )}
          </button>
          {isOpen && (
            <span className="mr-2 bg-white/80 backdrop-blur-sm px-2 py-1 rounded text-[#2E1813] text-sm shadow-sm">
              Meeting
            </span>
          )}
        </div>
      </div>
    </>
  );
};

export default FloatingActionButton;
