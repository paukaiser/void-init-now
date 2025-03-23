
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, CheckCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import TaskCard from '@/components/TaskCard';
import { useTasks } from '@/hooks/useTasks';
import { useToast } from "@/hooks/use-toast";

const Inbox: React.FC = () => {
  const navigate = useNavigate();
  const { tasks, loading, markAsRead, markAllAsRead } = useTasks();
  const { toast } = useToast();
  
  useEffect(() => {
    // This would be a good place to set up real-time updates
    // if implementing Hubspot webhook integration
  }, []);
  
  const handleTaskClick = (taskId: string) => {
    markAsRead(taskId);
    toast({
      title: "Task marked as read",
      description: "The task has been marked as read",
    });
  };
  
  const handleMarkAllAsRead = () => {
    markAllAsRead();
    toast({
      title: "All tasks marked as read",
      description: "All tasks have been marked as read",
    });
  };
  
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
            
            {tasks.length > 0 && (
              <Button 
                variant="ghost" 
                className="flex items-center text-sm"
                onClick={handleMarkAllAsRead}
              >
                <CheckCircle size={16} className="mr-1" />
                Mark all as read
              </Button>
            )}
          </div>
          
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2E1813]"></div>
            </div>
          ) : tasks.length > 0 ? (
            <div className="space-y-3">
              {tasks.map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onClick={() => handleTaskClick(task.id)}
                />
              ))}
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
