
import React, { useState } from 'react';
import { Calendar, Phone, X, Calendar as CalendarIcon, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Task } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useState as useStateDialog } from "react";
import { Label } from "@/components/ui/label";

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  onComplete?: (taskId: string) => void;
  onDisqualify?: (taskId: string, reason: string, otherReason?: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick, onComplete, onDisqualify }) => {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [disqualifyReason, setDisqualifyReason] = useState<string>("");
  const [otherReason, setOtherReason] = useState<string>("");
  const [showDisqualifyDialog, setShowDisqualifyDialog] = useState(false);
  
  const handleCardClick = () => {
    setIsDialogOpen(true);
    if (onClick) onClick();
  };
  
  const handleScheduleMeeting = () => {
    setIsDialogOpen(false);
    // If this task is scheduled, we also mark it as completed
    if (onComplete) onComplete(task.id);
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
  
  const handleComplete = () => {
    toast.success(`Task for ${task.contactName} marked as completed`);
    setIsDialogOpen(false);
    if (onComplete) onComplete(task.id);
  };
  
  const openDisqualifyDialog = () => {
    setShowDisqualifyDialog(true);
    setIsDialogOpen(false);
  };

  const handleDisqualify = () => {
    if (!disqualifyReason) {
      toast.error("Please select a disqualification reason");
      return;
    }

    if (disqualifyReason === "Other" && !otherReason) {
      toast.error("Please provide details for the other reason");
      return;
    }

    if (onDisqualify) {
      onDisqualify(
        task.id, 
        disqualifyReason, 
        disqualifyReason === "Other" ? otherReason : undefined
      );
    }
    
    toast.info(`Task for ${task.contactName} marked as disqualified`);
    setShowDisqualifyDialog(false);
  };
  
  return (
    <>
      <Card 
        className={`cursor-pointer transition-all hover:shadow-md ${!task.isRead ? 'border-l-4 border-l-[#2E1813]' : ''}`}
        onClick={handleCardClick}
      >
        <CardContent className="p-2">
          <div className="flex flex-col">
            <h3 className="font-semibold text-xs">{task.contactName}</h3>
            <p className="text-xs text-muted-foreground truncate">{task.restaurantName}</p>
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Actions for {task.contactName}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-2 py-2">
            <div className="text-sm">
              <p><span className="font-medium">Restaurant:</span> {task.restaurantName}</p>
              <p><span className="font-medium">Cuisine:</span> {task.cuisine}</p>
              <p><span className="font-medium">Phone:</span> {task.phoneNumber}</p>
              <p><span className="font-medium">Email:</span> {task.email}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button 
              onClick={handleCall} 
              className="w-full flex items-center justify-center"
              variant="outline"
              size="sm"
            >
              <Phone size={16} className="mr-1" />
              Call
            </Button>
            <Button 
              onClick={handleScheduleMeeting} 
              className="w-full flex items-center justify-center"
              variant="outline"
              size="sm"
            >
              <CalendarIcon size={16} className="mr-1" />
              Schedule
            </Button>
            <Button 
              onClick={openDisqualifyDialog} 
              className="w-full flex items-center justify-center"
              variant="outline"
              size="sm"
            >
              <XCircle size={16} className="mr-1" />
              Disqualify
            </Button>
            <Button 
              onClick={handleComplete} 
              className="w-full flex items-center justify-center"
              variant="outline"
              size="sm"
            >
              <CheckCircle size={16} className="mr-1" />
              Complete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showDisqualifyDialog} onOpenChange={setShowDisqualifyDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Disqualify {task.contactName}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="disqualify-reason">Disqualification Reason</Label>
              <Select 
                onValueChange={(value) => setDisqualifyReason(value)}
                value={disqualifyReason}
              >
                <SelectTrigger id="disqualify-reason">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bad Timing">Bad Timing</SelectItem>
                  <SelectItem value="Budget Constraints">Budget Constraints</SelectItem>
                  <SelectItem value="No Decision-making Power">No Decision-making Power</SelectItem>
                  <SelectItem value="Competitor Preference">Competitor Preference</SelectItem>
                  <SelectItem value="Not a Good Fit">Not a Good Fit</SelectItem>
                  <SelectItem value="No Interest">No Interest</SelectItem>
                  <SelectItem value="Prior Negative Experience">Prior Negative Experience</SelectItem>
                  <SelectItem value="Technical Limitations">Technical Limitations</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {disqualifyReason === "Other" && (
              <div className="space-y-2">
                <Label htmlFor="other-reason">Disqualification Reason - Other</Label>
                <Input 
                  id="other-reason" 
                  value={otherReason}
                  onChange={(e) => setOtherReason(e.target.value)}
                  placeholder="Please specify the reason"
                />
              </div>
            )}

            <Button 
              onClick={handleDisqualify} 
              className="w-full"
            >
              Submit
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TaskCard;
