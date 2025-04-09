
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
        className="fixed bottom-6 right-6 z-40"
      >
        <div className="flex flex-col items-end space-y-4">
          {/* Task button - appears above the main button when open */}
          {isOpen && (
            <div className="flex items-center">
              <span className="mr-2 bg-white/80 backdrop-blur-sm px-2 py-1 rounded text-[#2E1813] text-sm shadow-sm">
                Task
              </span>
              <button 
                className="bg-[#FF8769] text-white rounded-full shadow-lg w-12 h-12 flex items-center justify-center"
                onClick={handleCreateTask}
                aria-label="Create Task"
              >
                <FileText size={20} />
              </button>
            </div>
          )}
          
          {/* Main FAB button */}
          <div className="flex items-center">
            {isOpen && (
              <span className="mr-2 bg-white/80 backdrop-blur-sm px-2 py-1 rounded text-[#2E1813] text-sm shadow-sm">
                Meeting
              </span>
            )}
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
          </div>
        </div>
      </div>
    </>
  );
};

export default FloatingActionButton;
