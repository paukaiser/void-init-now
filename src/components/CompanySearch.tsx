import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar.tsx";
import { useUser } from "../hooks/useUser.ts";

interface UserProfileProps {
  small?: boolean;
}

const UserProfile: React.FC<UserProfileProps> = ({ small = false }) => {
  const user = useUser();

  if (!user) return null; // or a skeleton loader

  // Extract name portion before the @ symbol if it's an email
  const displayName = user.name || (user.email ? user.email.split('@')[0] : 'User');
  
  // Create avatar text from the display name
  const avatarText = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  if (small) {
    return (
      <div className="flex items-center gap-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src="https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&h=200&q=80" alt={displayName} />
          <AvatarFallback>{avatarText}</AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium">{displayName}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4 p-4 bg-white/90 rounded-lg border border-gray-200 shadow-sm">
      <Avatar className="h-12 w-12">
        <AvatarImage src="https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&h=200&q=80" alt={displayName} />
        <AvatarFallback>{avatarText}</AvatarFallback>
      </Avatar>
      <div>
        <p className="text-base font-medium">{displayName}</p>
        <p className="text-sm text-muted-foreground">{user.email ? user.email.split('@')[0] : ''}</p>
      </div>
    </div>
  );
};

export default UserProfile;
