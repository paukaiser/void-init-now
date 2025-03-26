
import React from 'react';
import { Calendar, Mail, Phone } from 'lucide-react';
import { format } from 'date-fns';
import { Task } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  const formattedDate = format(new Date(task.createdAt), 'dd MMM yyyy, HH:mm');
  
  return (
    <Card 
      className={`mb-3 cursor-pointer transition-all hover:shadow-md ${!task.isRead ? 'border-l-4 border-l-[#2E1813]' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-lg">{task.contactName}</h3>
          <span className="text-xs text-muted-foreground">{formattedDate}</span>
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
  );
};

export default TaskCard;
