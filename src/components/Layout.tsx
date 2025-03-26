
import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Calendar, Inbox } from 'lucide-react';
import UserProfile from '@/components/UserProfile';
import { useTasks } from '@/hooks/useTasks';
import NotificationBadge from '@/components/NotificationBadge';

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const { unreadCount } = useTasks();
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Bar */}
      <header className="p-4 flex justify-between items-center border-b bg-white/90 sticky top-0 z-10">
        <h1 className="text-lg font-medium tracking-tight">allO Field Sales App</h1>
        <div className="flex items-center gap-2">
          <UserProfile small={true} />
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-grow p-4">
        <Outlet />
      </main>
      
      {/* Bottom Navigation */}
      <nav className="border-t bg-white py-2 px-4 sticky bottom-0 z-10">
        <div className="flex justify-around items-center">
          <button 
            className="flex flex-col items-center p-2 text-sm"
            onClick={() => navigate('/meetings')}
          >
            <Calendar size={24} className="mb-1" />
            <span>Meetings</span>
          </button>
          
          <button 
            className="flex flex-col items-center p-2 text-sm relative"
            onClick={() => navigate('/inbox')}
          >
            <div className="relative">
              <Inbox size={24} className="mb-1" />
              <NotificationBadge count={unreadCount} className="top-0 right-0 absolute" />
            </div>
            <span>Inbox</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Layout;
