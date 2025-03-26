
import React from 'react';
import TaskCard from '@/components/TaskCard';
import { useTasks } from '@/hooks/useTasks';

const Inbox: React.FC = () => {
  const { tasks, markAsRead } = useTasks();
  
  const handleTaskClick = (taskId: string) => {
    markAsRead(taskId);
  };
  
  return (
    <div className="w-full max-w-5xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">My Inbox</h2>
      
      <div className="space-y-4">
        {tasks.length > 0 ? (
          tasks.map(task => (
            <TaskCard 
              key={task.id} 
              task={task}
              onClick={() => handleTaskClick(task.id)}
            />
          ))
        ) : (
          <p className="text-center py-10 text-muted-foreground">
            No tasks at the moment. Great job keeping your inbox clean!
          </p>
        )}
      </div>
    </div>
  );
};

export default Inbox;
