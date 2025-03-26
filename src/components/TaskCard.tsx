
import React, { useState } from 'react';
import { Calendar, Mail, Phone, X, Calendar as CalendarIcon, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Task } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  const formattedDate = format(new Date(task.createdAt), 'dd MMM yyyy, HH:mm');
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const handleCardClick = () => {
    setIsDialogOpen(true);
    if (onClick) onClick();
  };
  
  const handleScheduleMeeting = () => {
    setIsDialogOpen(false);
    navigate('/add-meeting', {
      state: {
        companyName: task.restaurantName,
        companyId: `task-${task.id}`,
        contactName: task.contactName
      }
    });
  };
  
  const handleCall = () => {
    window.location.href = `tel:${task.phoneNumber}`;
    setIsDialogOpen(false);
  };
  
  const handleEmail = () => {
    window.location.href = `mailto:${task.email}`;
    setIsDialogOpen(false);
  };
  
  const handleComplete = () => {
    toast.success(`Task for ${task.contactName} marked as completed`);
    setIsDialogOpen(false);
    // In a real app, you would call an API to update the task
  };
  
  const handleDisqualify = () => {
    toast.info(`Task for ${task.contactName} marked as disqualified`);
    setIsDialogOpen(false);
    // In a real app, you would call an API to update the task
  };
  
  return (
    <>
      <Card 
        className={`mb-3 cursor-pointer transition-all hover:shadow-md ${!task.isRead ? 'border-l-4 border-l-[#2E1813]' : ''}`}
        onClick={handleCardClick}
      >
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-lg">{task.contactName}</h3>
          </div>
          
          <h4 className="text-sm font-medium mt-1">{task.restaurantName}</h4>
          <p className="text-xs text-muted-foreground">{task.cuisine}</p>
          
          <div className="grid grid-cols-1 gap-1 mt-3">
            <div className="flex items-center text-sm">
              <Phone size={14} className="mr-2" />
              <span>{task.phoneNumber}</span>
            </div>
            
            <div className="flex items-center text-sm">
              <Mail size={14} className="mr-2" />
              <span className="text-sm truncate">{task.email}</span>
            </div>
            
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar size={14} className="mr-2" />
              <span>Created: {formattedDate}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Actions for {task.contactName}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Button 
              onClick={handleScheduleMeeting} 
              className="w-full flex items-center justify-start"
              variant="outline"
            >
              <CalendarIcon size={16} className="mr-2" />
              Schedule Meeting
            </Button>
            <Button 
              onClick={handleCall} 
              className="w-full flex items-center justify-start"
              variant="outline"
            >
              <Phone size={16} className="mr-2" />
              Call
            </Button>
            <Button 
              onClick={handleEmail} 
              className="w-full flex items-center justify-start"
              variant="outline"
            >
              <Mail size={16} className="mr-2" />
              Email
            </Button>
            <Button 
              onClick={handleComplete} 
              className="w-full flex items-center justify-start"
              variant="outline"
            >
              <CheckCircle size={16} className="mr-2" />
              Mark as Completed
            </Button>
            <Button 
              onClick={handleDisqualify} 
              className="w-full flex items-center justify-start"
              variant="outline"
            >
              <XCircle size={16} className="mr-2" />
              Disqualify
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TaskCard;
