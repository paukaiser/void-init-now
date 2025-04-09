
import React, { useState, useEffect } from 'react';
import { useTasks } from '@/hooks/useTasks';
import WeeklyOverview from '@/components/WeeklyOverview';
import CalendarView from '@/components/CalendarView';
import TaskCard from '@/components/TaskCard';
import FloatingActionButton from '@/components/FloatingActionButton';
import { Meeting } from '@/components/MeetingCard';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";

const Dashboard: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateTaskDialogOpen, setIsCreateTaskDialogOpen] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskCompany, setNewTaskCompany] = useState('');
  const [newTaskContact, setNewTaskContact] = useState('');
  const [newTaskPhone, setNewTaskPhone] = useState('');
  const userId = "current-user"; // In a real app, you'd get this from auth context
  
  const { tasks, markAsRead, markAsCompleted, disqualifyTask } = useTasks();
  const navigate = useNavigate();
  
  // Add overflow hidden to body when component mounts
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
  };
  
  const handleCreateTask = () => {
    if (!newTaskName || !newTaskCompany || !newTaskContact) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    toast.success(`Task "${newTaskName}" created successfully`);
    setIsCreateTaskDialogOpen(false);
    
    setNewTaskName('');
    setNewTaskCompany('');
    setNewTaskContact('');
    setNewTaskPhone('');
  };
  
  const incompleteTasks = tasks.filter(task => !task.completed && !task.disqualified);
  
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
        {incompleteTasks.length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-1 text-muted-foreground">Your Tasks</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {incompleteTasks.map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task}
                  onClick={() => handleTaskClick(task.id)}
                  onComplete={handleTaskComplete}
                  onDisqualify={handleTaskDisqualify}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="flex-grow overflow-hidden">
        <h3 className="text-sm font-medium mb-1 text-muted-foreground">Your Meetings</h3>
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
              <Label htmlFor="task-name">Task Name</Label>
              <Input 
                id="task-name" 
                value={newTaskName}
                onChange={(e) => setNewTaskName(e.target.value)}
                placeholder="Follow up with client"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="company">Company</Label>
              <Input 
                id="company" 
                value={newTaskCompany}
                onChange={(e) => setNewTaskCompany(e.target.value)}
                placeholder="Acme Inc."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contact">Contact Person</Label>
              <Input 
                id="contact" 
                value={newTaskContact}
                onChange={(e) => setNewTaskContact(e.target.value)}
                placeholder="John Doe"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input 
                id="phone" 
                value={newTaskPhone}
                onChange={(e) => setNewTaskPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <Button 
              className="w-full mt-2"
              onClick={handleCreateTask}
            >
              Create Task
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
