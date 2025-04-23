
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, FileText, Inbox } from 'lucide-react';
import { Button } from "@/components/ui/button";
import UserProfile from '@/components/UserProfile';
import NotificationBadge from '@/components/NotificationBadge';
import { useTasks } from '@/hooks/useTasks';

const Index: React.FC = () => {
  const navigate = useNavigate();
  const { unreadCount } = useTasks();
  
  return (
    <div className="allo-page relative">
      <div className="absolute top-4 right-4">
        <UserProfile small />
      </div>
      
      <div className="allo-container transition-slide-up">
        <div className="flex items-center justify-center w-full mb-8">
          <h1 className="text-3xl font-bold tracking-tight">allO Field Sales App</h1>
        </div>
        
        <div className="w-full max-w-md mx-auto">
          <div className="mt-12 grid grid-cols-1 gap-6">
            <Button 
              className="allo-button flex items-center justify-center h-16 text-base"
              onClick={() => navigate('/dashboard')}
            >
              <CalendarDays size={20} className="mr-2" />
              My Meetings
            </Button>
            
            <Button 
              className="allo-button flex items-center justify-center h-16 text-base relative"
              onClick={() => navigate('/inbox')}
            >
              <Inbox size={20} className="mr-2" />
              My Inbox
              <NotificationBadge count={unreadCount} />
            </Button>
            
            <Button 
              className="allo-button-secondary flex items-center justify-center h-16 text-base"
              onClick={() => navigate('/create-contract')}
            >
              <FileText size={20} className="mr-2" />
              Create a Contract
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
