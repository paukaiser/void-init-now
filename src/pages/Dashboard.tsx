import React, { useState, useEffect } from 'react';
import { useTasks } from '@/hooks/useTasks';
import WeeklyOverview from '@/components/WeeklyOverview';
import CalendarView from '@/components/CalendarView';
import TaskCard from '@/components/TaskCard';
import FloatingActionButton from '@/components/FloatingActionButton';
import { Meeting } from '@/components/MeetingCard';
import { format, addDays, addWeeks, isPast, isSameDay } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { Calendar as CalendarIcon, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

const Dashboard: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateTaskDialogOpen, setIsCreateTaskDialogOpen] = useState(false);
  const [newTaskCompany, setNewTaskCompany] = useState('');
  const [moreInfo, setMoreInfo] = useState('');
  const [followUpDate, setFollowUpDate] = useState<Date | undefined>(undefined);
  const [customDateMode, setCustomDateMode] = useState(false);
  const [showAllTasks, setShowAllTasks] = useState(false);
  const userId = "current-user"; // In a real app, you'd get this from auth context
  
  const { tasks, markAsRead, markAsCompleted, disqualifyTask, createTask } = useTasks();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);
  
  useEffect(() => {
    const fetchMeetings = async () => {
      setLoading(true);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const meetingTime1 = new Date(today);
      meetingTime1.setHours(9, 0, 0);
      
      const meetingTime2 = new Date(today);
      meetingTime2.setHours(11, 30, 0);
      
      const meetingTime3 = new Date(today);
      meetingTime3.setHours(13, 45, 0);
      
      const meetingTime4 = new Date(today);
      meetingTime4.setHours(16, 0, 0);
      
      const mockMeetings: Meeting[] = [
        {
          id: '1',
          title: 'Product Demo',
          contactName: 'Sarah Chen',
          companyName: 'Acme Inc',
          startTime: meetingTime1.toISOString(),
          endTime: new Date(meetingTime1.getTime() + 60 * 60 * 1000).toISOString(),
          date: format(today, 'dd.MM.yyyy'),
          type: 'sales meeting',
          status: 'scheduled'
        },
        {
          id: '2',
          title: 'Contract Discussion',
          contactName: 'Michael Rodriguez',
          companyName: 'Global Tech',
          startTime: meetingTime2.toISOString(),
          endTime: new Date(meetingTime2.getTime() + 40 * 60 * 1000).toISOString(),
          date: format(today, 'dd.MM.yyyy'),
          type: 'sales followup',
          status: 'completed'
        },
        {
          id: '3',
          title: 'Initial Consultation',
          contactName: 'David Park',
          companyName: 'Innovate Solutions',
          startTime: meetingTime3.toISOString(),
          endTime: new Date(meetingTime3.getTime() + 2 * 60 * 60 * 1000).toISOString(),
          date: format(today, 'dd.MM.yyyy'),
          type: 'sales meeting',
          status: 'scheduled'
        },
        {
          id: '4',
          title: 'Product Roadmap',
          contactName: 'Emma Watson',
          companyName: 'Tech Forward',
          startTime: meetingTime4.toISOString(),
          endTime: new Date(meetingTime4.getTime() + 75 * 60 * 1000).toISOString(),
          date: format(today, 'dd.MM.yyyy'),
          type: 'sales followup',
          status: 'rescheduled'
        }
      ];
      
      setMeetings(mockMeetings);
      setLoading(false);
    };
    
    fetchMeetings();
  }, [userId, currentDate]);
  
  const handleDateSelect = (date: Date) => {
    setCurrentDate(date);
  };
  
  const handleTaskClick = (taskId: string) => {
    markAsRead(taskId);
  };

  const handleTaskComplete = (taskId: string) => {
    markAsCompleted(taskId);
  };

  const handleTaskDisqualify = (taskId: string, reason: string, otherReason?: string) => {
    disqualifyTask(taskId, reason, otherReason);
  };
  
  const openCreateTaskDialog = () => {
    setIsCreateTaskDialogOpen(true);
    setFollowUpDate(undefined);
    setCustomDateMode(false);
  };
  
  const handleCreateTask = () => {
    if (!newTaskCompany) {
      toast.error("Please enter a restaurant name");
      return;
    }
    
    if (!followUpDate) {
      toast.error("Please select a follow-up date");
      return;
    }

    createTask({
      restaurantName: newTaskCompany,
      moreInfo: moreInfo,
      dueDate: format(followUpDate, 'yyyy-MM-dd')
    });
    
    toast.success(`Task created for ${format(followUpDate, 'MMMM dd, yyyy')}`);
    setIsCreateTaskDialogOpen(false);
    
    // Reset form
    setNewTaskCompany('');
    setMoreInfo('');
    setFollowUpDate(undefined);
    setCustomDateMode(false);
  };

  const setFollowUpDays = (days: number) => {
    const date = addDays(new Date(), days);
    setFollowUpDate(date);
    setCustomDateMode(false);
  };

  const setFollowUpWeeks = (weeks: number) => {
    const date = addWeeks(new Date(), weeks);
    setFollowUpDate(date);
    setCustomDateMode(false);
  };

  const handleSelectCustomDate = () => {
    setCustomDateMode(true);
  };

  const handleCancelTask = () => {
    setIsCreateTaskDialogOpen(false);
    // Reset form
    setNewTaskCompany('');
    setMoreInfo('');
    setFollowUpDate(undefined);
    setCustomDateMode(false);
  };
  
  const tasksForSelectedDate = tasks.filter(task => 
    !task.completed && 
    !task.disqualified && 
    (isSameDay(new Date(task.dueDate), currentDate) || 
     (isPast(new Date(task.dueDate)) && !isSameDay(new Date(task.dueDate), new Date())))
  );
  
  const displayedTasks = isMobile && !showAllTasks ? tasksForSelectedDate.slice(0, 4) : tasksForSelectedDate;
  const hasMoreTasks = isMobile && tasksForSelectedDate.length > 4;
  
  return (
    <div className="h-screen overflow-hidden flex flex-col">
      <div className="flex-none">
        <WeeklyOverview 
          currentDate={currentDate}
          meetings={meetings}
          tasks={tasks}
          onDateSelect={handleDateSelect}
        />
      </div>
      
      <div className="flex-none mb-2">
        {tasksForSelectedDate.length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-1 text-muted-foreground">Tasks</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {displayedTasks.map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task}
                  onClick={() => handleTaskClick(task.id)}
                  onComplete={handleTaskComplete}
                  onDisqualify={handleTaskDisqualify}
                />
              ))}
            </div>
            {hasMoreTasks && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-1 flex items-center justify-center"
                onClick={() => setShowAllTasks(!showAllTasks)}
              >
                {showAllTasks ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" />
                    Show less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" />
                    Show all
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </div>
      
      <div className="flex-grow overflow-hidden">
        <h3 className="text-sm font-medium mb-1 text-muted-foreground">Meetings</h3>
        <div className="h-full overflow-hidden">
          <CalendarView userId={userId} selectedDate={currentDate} />
        </div>
      </div>
      
      <FloatingActionButton onCreateTask={openCreateTaskDialog} />
      
      <Dialog open={isCreateTaskDialogOpen} onOpenChange={setIsCreateTaskDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="company">Restaurant</Label>
              <Input 
                id="company" 
                value={newTaskCompany}
                onChange={(e) => setNewTaskCompany(e.target.value)}
                placeholder="Restaurant name"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="moreInfo">More Info (optional)</Label>
              <Input 
                id="moreInfo" 
                value={moreInfo}
                onChange={(e) => setMoreInfo(e.target.value)}
                placeholder="Additional information"
              />
            </div>
            
            <div className="grid gap-2">
              <Label>When to follow up?</Label>
              
              {!customDateMode && (
                <div className="space-y-2">
                  <Button 
                    type="button" 
                    onClick={() => setFollowUpDays(3)}
                    variant="outline"
                    className={cn(
                      "w-full justify-center py-6 text-base font-medium",
                      followUpDate && format(followUpDate, 'yyyy-MM-dd') === format(addDays(new Date(), 3), 'yyyy-MM-dd') && "bg-[#E5DEFF] text-black border-[#E5DEFF] hover:bg-[#E5DEFF]/90 hover:text-black hover:border-[#E5DEFF]"
                    )}
                  >
                    In 3 days
                  </Button>
                  
                  <Button 
                    type="button" 
                    onClick={() => setFollowUpWeeks(1)}
                    variant="outline"
                    className={cn(
                      "w-full justify-center py-6 text-base font-medium",
                      followUpDate && format(followUpDate, 'yyyy-MM-dd') === format(addWeeks(new Date(), 1), 'yyyy-MM-dd') && "bg-[#E5DEFF] text-black border-[#E5DEFF] hover:bg-[#E5DEFF]/90 hover:text-black hover:border-[#E5DEFF]"
                    )}
                  >
                    In 1 week
                  </Button>
                  
                  <Button 
                    type="button" 
                    onClick={() => setFollowUpWeeks(2)}
                    variant="outline"
                    className={cn(
                      "w-full justify-center py-6 text-base font-medium",
                      followUpDate && format(followUpDate, 'yyyy-MM-dd') === format(addWeeks(new Date(), 2), 'yyyy-MM-dd') && "bg-[#E5DEFF] text-black border-[#E5DEFF] hover:bg-[#E5DEFF]/90 hover:text-black hover:border-[#E5DEFF]"
                    )}
                  >
                    In 2 weeks
                  </Button>
                  
                  <Button 
                    type="button" 
                    onClick={() => setFollowUpWeeks(3)}
                    variant="outline"
                    className={cn(
                      "w-full justify-center py-6 text-base font-medium",
                      followUpDate && format(followUpDate, 'yyyy-MM-dd') === format(addWeeks(new Date(), 3), 'yyyy-MM-dd') && "bg-[#E5DEFF] text-black border-[#E5DEFF] hover:bg-[#E5DEFF]/90 hover:text-black hover:border-[#E5DEFF]"
                    )}
                  >
                    In 3 weeks
                  </Button>
                  
                  <Button 
                    type="button" 
                    onClick={handleSelectCustomDate}
                    variant="outline"
                    className="w-full justify-center py-6 text-base font-medium flex items-center gap-2"
                  >
                    <CalendarIcon className="h-5 w-5" />
                    Select a date
                  </Button>
                </div>
              )}
              
              {customDateMode && (
                <div className="flex flex-col items-center space-y-2">
                  <Calendar
                    mode="single"
                    selected={followUpDate}
                    onSelect={(date) => setFollowUpDate(date)}
                    disabled={(date) => date < new Date()}
                    className="border rounded-md p-2 pointer-events-auto"
                  />
                  <Button 
                    type="button" 
                    onClick={() => setCustomDateMode(false)}
                    variant="outline"
                    size="sm"
                  >
                    Back to preset options
                  </Button>
                </div>
              )}
            </div>
            
            <div className="flex flex-col space-y-2">
              <Button 
                type="button" 
                onClick={handleCreateTask}
                disabled={!followUpDate}
                className="w-full"
              >
                Create Task
              </Button>
              
              <Button 
                type="button" 
                onClick={handleCancelTask}
                variant="outline"
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
