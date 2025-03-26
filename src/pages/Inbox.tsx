
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Phone, CheckCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import TaskCard from '@/components/TaskCard';
import { useTasks } from '@/hooks/useTasks';
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogTrigger, 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter 
} from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { Task } from '@/types';

const Inbox: React.FC = () => {
  const navigate = useNavigate();
  const { tasks, loading } = useTasks();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  useEffect(() => {
    // This would be a good place to set up real-time updates
    // if implementing Hubspot webhook integration
  }, []);
  
  const handleTaskClick = (task: Task) => {
    if (isMobile) {
      // Mobile handling is in the TaskCard component
      return;
    }
    
    // For desktop, show options dialog
    // This won't actually be triggered since we're using the Dialog component in this function
    // The actual handling is in the renderTaskOptions function
  };
  
  const handleScheduleMeeting = (task: Task) => {
    navigate('/add-meeting', {
      state: {
        companyName: task.restaurantName,
        companyId: `task-${task.id}`,
        contactName: task.contactName,
        contactId: `contact-${task.id}`,
      }
    });
  };
  
  const handleCompleteTask = (task: Task) => {
    // In a real app, this would mark the task as complete in the backend
    toast({
      title: "Task completed",
      description: `Task for ${task.contactName} marked as complete`,
    });
  };
  
  const renderTaskOptions = (task: Task) => (
    <Dialog>
      <DialogTrigger asChild>
        <div onClick={() => {/* Dialog handles the click */}}>
          <TaskCard key={task.id} task={task} />
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Task Options</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="mb-4">What would you like to do with this task?</p>
          <div className="space-y-3">
            <Button
              className="w-full flex justify-start"
              variant="outline"
              onClick={() => {
                window.location.href = `tel:${task.phoneNumber}`;
                const dialogClose = document.querySelector('[data-state="open"] [aria-label="Close"]') as HTMLButtonElement;
                if (dialogClose) dialogClose.click();
              }}
            >
              <Phone size={16} className="mr-2" />
              Call {task.contactName}
            </Button>
            <Button
              className="w-full flex justify-start"
              variant="outline"
              onClick={() => {
                handleScheduleMeeting(task);
                const dialogClose = document.querySelector('[data-state="open"] [aria-label="Close"]') as HTMLButtonElement;
                if (dialogClose) dialogClose.click();
              }}
            >
              <Plus size={16} className="mr-2" />
              Schedule Meeting
            </Button>
            <Button
              className="w-full flex justify-start"
              variant="outline"
              onClick={() => {
                handleCompleteTask(task);
                const dialogClose = document.querySelector('[data-state="open"] [aria-label="Close"]') as HTMLButtonElement;
                if (dialogClose) dialogClose.click();
              }}
            >
              <CheckCircle size={16} className="mr-2" />
              Mark as Complete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
  
  return (
    <div className="allo-page">
      <div className="allo-container">
        <Button 
          variant="outline" 
          className="self-start mb-6"
          onClick={() => navigate('/')}
        >
          <ChevronLeft size={16} className="mr-1" />
          Back
        </Button>
        
        <div className="w-full max-w-md mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">My Inbox</h2>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2E1813]"></div>
            </div>
          ) : tasks.length > 0 ? (
            <div className="space-y-3">
              {tasks.map(task => renderTaskOptions(task))}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <p>No tasks available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Inbox;
