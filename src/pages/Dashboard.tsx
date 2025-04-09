
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
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskCompany, setNewTaskCompany] = useState('');
  const [newTaskContact, setNewTaskContact] = useState('');
  const [newTaskPhone, setNewTaskPhone] = useState('');
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
    if (!newTaskCompany || !newTaskContact) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    if (!followUpDate) {
      toast.error("Please select a follow-up date");
      return;
    }

    const taskName = newTaskName || `Follow up with ${newTaskContact}`;
    
    createTask({
      contactName: newTaskContact,
      restaurantName: newTaskCompany,
      phoneNumber: newTaskPhone || '',
      email: '',
      cuisine: '',
      dueDate: format(followUpDate, 'yyyy-MM-dd')
    });
    
    toast.success(`Task "${taskName}" created for ${format(followUpDate, 'MMMM dd, yyyy')}`);
    setIsCreateTaskDialogOpen(false);
    
    // Reset form
    setNewTaskName('');
    setNewTaskCompany('');
    setNewTaskContact('');
    setNewTaskPhone('');
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
    setNewTaskName('');
    setNewTaskCompany('');
    setNewTaskContact('');
    setNewTaskPhone('');
    setFollowUpDate(undefined);
    setCustomDateMode(false);
  };
  
  // Filter tasks that are due on the selected date
  const tasksForSelectedDate = tasks.filter(task => 
    !task.completed && 
    !task.disqualified && 
    (isSameDay(new Date(task.dueDate), currentDate) || 
     (isPast(new Date(task.dueDate)) && !isSameDay(new Date(task.dueDate), currentDate)))
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
                    Show all ({tasksForSelectedDate.length})
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
              <Label htmlFor="contact">Contact Person</Label>
              <Input 
                id="contact" 
                value={newTaskContact}
                onChange={(e) => setNewTaskContact(e.target.value)}
                placeholder="Contact name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number (optional)</Label>
              <Input 
                id="phone" 
                value={newTaskPhone}
                onChange={(e) => setNewTaskPhone(e.target.value)}
                placeholder="+49 (123) 456-7890"
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
                      followUpDate && format(followUpDate, 'yyyy-MM-dd') === format(addDays(new Date(), 3), 'yyyy-MM-dd') && "bg-[#2E1813] text-white hover:bg-[#2E1813]/90"
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
                      followUpDate && format(followUpDate, 'yyyy-MM-dd') === format(addWeeks(new Date(), 1), 'yyyy-MM-dd') && "bg-[#2E1813] text-white hover:bg-[#2E1813]/90"
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
                      followUpDate && format(followUpDate, 'yyyy-MM-dd') === format(addWeeks(new Date(), 2), 'yyyy-MM-dd') && "bg-[#2E1813] text-white hover:bg-[#2E1813]/90"
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
                      followUpDate && format(followUpDate, 'yyyy-MM-dd') === format(addWeeks(new Date(), 3), 'yyyy-MM-dd') && "bg-[#2E1813] text-white hover:bg-[#2E1813]/90"
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
