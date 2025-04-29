
import React from 'react';
import TaskCard from './TaskCard';
import { Task } from '../types';
import { isPast, isToday } from 'date-fns';

interface TaskCardWrapperProps {
  task: Task;
  onClick: () => void;
  onComplete?: (id: string) => void;
  onDisqualify?: (id: string, reason: string, otherReason?: string) => void;
}

const TaskCardWrapper: React.FC<TaskCardWrapperProps> = ({
  task,
  onClick,
  onComplete,
  onDisqualify
}) => {
  const isOverdue = () => {
    const dueDate = new Date(task.dueDate);
    return !isToday(dueDate) && isPast(dueDate) && !task.completed && !task.disqualified;
  };

  return (
    <div className={`relative ${isOverdue() ? 'task-overdue' : ''}`}>
      {isOverdue() && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full z-10 animate-pulse" />
      )}
      <div className={isOverdue() ? 'border-l-2 border-red-500' : ''}>
        <TaskCard
          task={task}
          onClick={onClick}
          onComplete={onComplete}
          onDisqualify={onDisqualify}
        />
      </div>
    </div>
  );
};

export default TaskCardWrapper;
