
import React from 'react';
import { useAuth } from '../hooks/useAuth';

const UserMenu: React.FC = () => {
  const { user, signOut } = useAuth();
  
  if (!user) return null;
  
  return (
    <div className="relative flex items-center gap-2">
      <div className="flex flex-col items-end">
        <span className="text-sm font-medium">{user.email}</span>
      </div>
      <button 
        onClick={signOut}
        className="text-sm text-red-600 hover:text-red-800"
      >
        Sign out
      </button>
    </div>
  );
};

export default UserMenu;
