
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserProfileProps {
  small?: boolean;
}

const UserProfile: React.FC<UserProfileProps> = ({ small = false }) => {
  // In a real app, this would come from authentication
  const user = {
    name: "Alex Johnson",
    role: "Sales Representative",
    avatar: "/placeholder.svg" // Using placeholder as avatar
  };
  
  if (small) {
    return (
      <div className="flex items-center gap-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback>AJ</AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium">{user.name}</span>
      </div>
    );
  }
  
  return (
    <div className="flex items-center space-x-4 p-4 bg-white/90 rounded-lg border border-gray-200 shadow-sm">
      <Avatar className="h-12 w-12">
        <AvatarImage src={user.avatar} alt={user.name} />
        <AvatarFallback>AJ</AvatarFallback>
      </Avatar>
      <div>
        <p className="text-base font-medium">{user.name}</p>
        <p className="text-sm text-muted-foreground">{user.role}</p>
      </div>
    </div>
  );
};

export default UserProfile;
