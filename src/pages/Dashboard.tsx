
import React, { useState, useEffect } from 'react';
import { useUser } from '../hooks/useUser.ts';
import { useTasks } from '../hooks/useTasks.ts';
import WeeklyOverview from '../components/WeeklyOverview.tsx';
import CalendarView from '../components/CalendarView.tsx';
import TaskCard from '../components/TaskCard.tsx';
import FloatingActionButton from '../components/FloatingActionButton.tsx';
import { Meeting } from '../components/MeetingCard.tsx';
import { format, addDays, addWeeks, isPast, isSameDay } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog.tsx';
import { Button } from '../components/ui/button.tsx';
import { Input } from '../components/ui/input.tsx';
import { Label } from '../components/ui/label.tsx';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Calendar as CalendarIcon, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import { Calendar } from '../components/ui/calendar.tsx';
import { cn } from '../lib/utils.ts';
import { useIsMobile } from '../hooks/use-mobile.tsx';
import { useMeetingContext } from '../context/MeetingContext.tsx';


const Dashboard: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [isCreateTaskDialogOpen, setIsCreateTaskDialogOpen] = useState<boolean>(false);
  const [newTaskCompany, setNewTaskCompany] = useState('');
  const [moreInfo, setMoreInfo] = useState('');
  const [followUpDate, setFollowUpDate] = useState<Date | undefined>(undefined);
  const [customDateMode, setCustomDateMode] = useState(false);
  const [showAllTasks, setShowAllTasks] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);

  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const user = useUser();
  const { tasks, markAsRead, markAsCompleted, disqualifyTask, createTask } = useTasks();
  const { meetings } = useMeetingContext();


  const handleDateSelect = (date: Date) => setCurrentDate(date);

  const handleTaskClick = (taskId: string) => markAsRead(taskId);
  const handleTaskComplete = (taskId: string) => markAsCompleted(taskId);
  const handleTaskDisqualify = (taskId: string, reason: string, otherReason?: string) =>
    disqualifyTask(taskId, reason, otherReason);

  const openCreateTaskDialog = () => {
    setIsCreateTaskDialogOpen(true);
    setFollowUpDate(undefined);
    setCustomDateMode(false);
  };

  const handleCreateTask = () => {
    if (!newTaskCompany || !followUpDate) {
      toast.error("Please enter required fields");
      return;
    }

    createTask({
      restaurantName: newTaskCompany,
      moreInfo,
      dueDate: format(followUpDate, 'yyyy-MM-dd'),
    });

    toast.success(`Task created for ${format(followUpDate, 'MMMM dd, yyyy')}`);
    setIsCreateTaskDialogOpen(false);
    setNewTaskCompany('');
    setMoreInfo('');
    setFollowUpDate(undefined);
    setCustomDateMode(false);
  };

  const setFollowUpDays = (days: number) => {
    setFollowUpDate(addDays(new Date(), days));
    setCustomDateMode(false);
  };

  const setFollowUpWeeks = (weeks: number) => {
    setFollowUpDate(addWeeks(new Date(), weeks));
    setCustomDateMode(false);
  };

  const handleSelectCustomDate = () => setCustomDateMode(true);
  const handleCancelTask = () => {
    setIsCreateTaskDialogOpen(false);
    setNewTaskCompany('');
    setMoreInfo('');
    setFollowUpDate(undefined);
    setCustomDateMode(false);
  };

  const navigateToTasks = () => navigate('/inbox');

  if (!user || !user.user_id) {
    return <div className="p-6">🔄 Loading dashboard...</div>;
  }

  const tasksForSelectedDate = tasks.filter((task) => {
    const due = new Date(task.dueDate);

    // Show past + today tasks if today is selected
    if (isSameDay(currentDate, new Date())) {
      return (
        !task.completed &&
        !task.disqualified &&
        (isSameDay(due, currentDate) || isPast(due))
      );
    }

    // For future days, show only tasks due exactly on that day
    return (
      !task.completed &&
      !task.disqualified &&
      isSameDay(due, currentDate)
    );
  });

  const displayedTasks = isMobile && !showAllTasks
    ? tasksForSelectedDate.slice(0, 4)
    : tasksForSelectedDate;

  const hasMoreTasks = isMobile && tasksForSelectedDate.length > 4;

  return (
    <div className="h-screen overflow-hidden flex flex-col">
      <div className="flex-none">
        <WeeklyOverview
          currentDate={currentDate}
          meetings={meetings} {/* Pass meetings from context */}
          tasks={tasks}
          onDateSelect={handleDateSelect}
        />
      </div>

      <div className="flex-none mb-2">
        {tasksForSelectedDate.length > 0 ? (
          <div>
            <div className="flex items-center cursor-pointer" onClick={navigateToTasks}>
              <h3 className="text-sm font-medium mb-1 text-muted-foreground">Tasks</h3>
              <ArrowRight className="h-4 w-4 ml-1 text-muted-foreground" />
            </div>
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
        ) : (
          <div className="flex items-center justify-center">
            <p className="text-sm text-muted-foreground">No tasks for this day. Check all your tasks in the </p>
            <Button variant="link" onClick={navigateToTasks} className="ml-1">Inbox</Button>
          </div>
        )}
      </div>

      <div className="flex-grow overflow-hidden">
        <h3 className="text-sm font-medium mb-1 text-muted-foreground">Meetings</h3>
        <div className="h-full overflow-hidden">
          <CalendarView
            userId={user.user_id}
            selectedDate={currentDate}
            onSelectMeeting={(meeting) => setSelectedMeeting(meeting)}
            onFetchedMeetings={(meetings) => setMeetings(meetings)} // ✅ here!
          />
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
                  <Button type="button" onClick={() => setFollowUpDays(3)} variant="outline">
                    In 3 days
                  </Button>
                  <Button type="button" onClick={() => setFollowUpWeeks(1)} variant="outline">
                    In 1 week
                  </Button>
                  <Button type="button" onClick={() => setFollowUpWeeks(2)} variant="outline">
                    In 2 weeks
                  </Button>
                  <Button type="button" onClick={() => setFollowUpWeeks(3)} variant="outline">
                    In 3 weeks
                  </Button>
                  <Button type="button" onClick={handleSelectCustomDate} variant="outline">
                    <CalendarIcon className="h-5 w-5 mr-2" />
                    Select a date
                  </Button>
                </div>
              )}

              {customDateMode && (
                <div className="flex flex-col items-center space-y-2">
                  <Calendar
                    mode="single"
                    selected={followUpDate}
                    onSelect={setFollowUpDate}
                    disabled={(date) => date < new Date()}
                  />
                  <Button type="button" onClick={() => setCustomDateMode(false)} variant="outline" size="sm">
                    Back to preset options
                  </Button>
                </div>
              )}
            </div>

            <div className="flex flex-col space-y-2">
              <Button type="button" onClick={handleCreateTask} disabled={!followUpDate} className="w-full">
                Create Task
              </Button>
              <Button type="button" onClick={handleCancelTask} variant="outline" className="w-full">
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
