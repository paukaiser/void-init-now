
import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Calendar, Inbox, Layout as LayoutIcon } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import NotificationBadge from '@/components/NotificationBadge';
import { cn } from '@/lib/utils';

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const { unreadCount } = useTasks();
  const location = useLocation();
  
  const isDashboardActive = location.pathname === '/dashboard';
  const isInboxActive = location.pathname === '/inbox';
  const isMeetingsActive = location.pathname === '/meetings';
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Main Content */}
      <main className="flex-grow p-4">
        <Outlet />
      </main>
      
      {/* Bottom Navigation */}
      <nav className="border-t bg-white py-2 px-4 sticky bottom-0 z-10">
        <div className="flex justify-around items-center">
          <button 
            className={cn(
              "flex flex-col items-center p-2 text-sm w-1/3 rounded-l-lg transition-colors",
              isDashboardActive ? "bg-[#FF8769]/10 text-[#FF8769]" : ""
            )}
            onClick={() => navigate('/dashboard')}
          >
            <LayoutIcon size={24} className="mb-1" />
            <span>Dashboard</span>
          </button>
          
          <button 
            className={cn(
              "flex flex-col items-center p-2 text-sm w-1/3 transition-colors",
              isMeetingsActive ? "bg-[#FF8769]/10 text-[#FF8769]" : ""
            )}
            onClick={() => navigate('/meetings')}
          >
            <Calendar size={24} className="mb-1" />
            <span>Meetings</span>
          </button>
          
          <button 
            className={cn(
              "flex flex-col items-center p-2 text-sm relative w-1/3 rounded-r-lg transition-colors",
              isInboxActive ? "bg-[#FF8769]/10 text-[#FF8769]" : ""
            )}
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
