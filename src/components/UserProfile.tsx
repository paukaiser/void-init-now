
import React from 'react';
import { useUser } from "../hooks/useUser.ts";

interface UserProfileProps {
  small?: boolean;
}

const UserProfile: React.FC<UserProfileProps> = ({ small = false }) => {
  const user = useUser();

  if (!user) return null; // or a skeleton loader

  // Extract name portion before @allo.restaurant
  const displayName = user.name || (user.email ? user.email.split('@')[0] : 'User');
  
  if (small) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{displayName}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center p-4 bg-white/90 rounded-lg border border-gray-200 shadow-sm">
      <div>
        <p className="text-base font-medium">{displayName}</p>
      </div>
    </div>
  );
};

export default UserProfile;
