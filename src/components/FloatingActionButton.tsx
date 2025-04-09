
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Calendar, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface FloatingActionButtonProps {
  onCreateTask?: () => void;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onCreateTask }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreateMeetingDialogOpen, setIsCreateMeetingDialogOpen] = useState(false);
  const [newMeetingTitle, setNewMeetingTitle] = useState('');
  const [newMeetingCompany, setNewMeetingCompany] = useState('');
  const [newMeetingContact, setNewMeetingContact] = useState('');
  const [newMeetingDate, setNewMeetingDate] = useState('');
  const [newMeetingTime, setNewMeetingTime] = useState('');
  
  const navigate = useNavigate();
  const fabRef = useRef<HTMLDivElement>(null);

  const toggleOptions = () => {
    setIsOpen(!isOpen);
  };

  const handleCreateMeeting = () => {
    setIsOpen(false);
    setIsCreateMeetingDialogOpen(true);
  };

  const handleCreateTask = () => {
    setIsOpen(false);
    if (onCreateTask) {
      onCreateTask();
    }
  };
  
  const handleSubmitMeeting = () => {
    if (!newMeetingTitle || !newMeetingCompany || !newMeetingContact || !newMeetingDate || !newMeetingTime) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    toast.success(`Meeting "${newMeetingTitle}" created successfully`);
    setIsCreateMeetingDialogOpen(false);
    
    // Reset form fields
    setNewMeetingTitle('');
    setNewMeetingCompany('');
    setNewMeetingContact('');
    setNewMeetingDate('');
    setNewMeetingTime('');
    
    // Optional: Navigate to meetings page after creation
    // navigate('/meetings');
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
                className="bg-black hover:bg-black/90 text-[#FF8769] rounded-full shadow-lg w-12 h-12 flex items-center justify-center"
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
                <Calendar size={24} onClick={handleCreateMeeting} />
              ) : (
                <Plus size={24} />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Create Meeting Dialog */}
      <Dialog open={isCreateMeetingDialogOpen} onOpenChange={setIsCreateMeetingDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule New Meeting</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="meeting-title">Meeting Title</Label>
              <Input 
                id="meeting-title" 
                value={newMeetingTitle}
                onChange={(e) => setNewMeetingTitle(e.target.value)}
                placeholder="Product Demo"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="company">Company</Label>
              <Input 
                id="company" 
                value={newMeetingCompany}
                onChange={(e) => setNewMeetingCompany(e.target.value)}
                placeholder="Acme Inc."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contact">Contact Person</Label>
              <Input 
                id="contact" 
                value={newMeetingContact}
                onChange={(e) => setNewMeetingContact(e.target.value)}
                placeholder="John Doe"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input 
                  id="date" 
                  type="date"
                  value={newMeetingDate}
                  onChange={(e) => setNewMeetingDate(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="time">Time</Label>
                <Input 
                  id="time" 
                  type="time"
                  value={newMeetingTime}
                  onChange={(e) => setNewMeetingTime(e.target.value)}
                />
              </div>
            </div>
            <Button 
              className="w-full mt-2"
              onClick={handleSubmitMeeting}
            >
              Schedule Meeting
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FloatingActionButton;
