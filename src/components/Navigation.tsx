
import { useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Calendar, Inbox } from 'lucide-react';

const Navigation = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <nav className="bg-white border-b border-gray-200 fixed w-full top-0 left-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-[#2E1813]">
                HubSpot Meetings
              </span>
            </div>
            <div className="ml-10 flex items-center space-x-4">
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium ${
                    isActive
                      ? 'text-[#FF8769] bg-gray-50'
                      : 'text-gray-600 hover:text-[#FF8769] hover:bg-gray-50'
                  }`
                }
              >
                <div className="flex items-center space-x-1">
                  <Calendar size={16} />
                  <span>Meetings</span>
                </div>
              </NavLink>
              <NavLink
                to="/inbox"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium ${
                    isActive
                      ? 'text-[#FF8769] bg-gray-50'
                      : 'text-gray-600 hover:text-[#FF8769] hover:bg-gray-50'
                  }`
                }
              >
                <div className="flex items-center space-x-1">
                  <Inbox size={16} />
                  <span>Inbox</span>
                </div>
              </NavLink>
            </div>
          </div>
          <div className="flex items-center">
            <Button
              variant="ghost"
              className="flex items-center space-x-1 text-gray-600 hover:text-red-500"
              onClick={handleLogout}
            >
              <LogOut size={16} />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
