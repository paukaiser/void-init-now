
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface UserInfo {
  name: string;
  email: string;
  avatarUrl?: string;
}

const UserProfile: React.FC = () => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // In a real app, you would fetch this information from your API
    // For now, we'll extract it from the URL or use mock data
    const pathSegments = location.pathname.split('/');
    const userSlug = pathSegments.length > 1 ? pathSegments[1] : '';
    
    // Mock data - in reality would come from API
    setTimeout(() => {
      if (userSlug) {
        // Try to decode name from slug
        const decodedName = decodeURIComponent(userSlug.replace(/-/g, ' '));
        setUser({
          name: decodedName || 'Alex Johnson',
          email: `${decodedName.toLowerCase().replace(/\s/g, '.')}@allo.com` || 'alex.johnson@allo.com',
          avatarUrl: 'https://api.dicebear.com/7.x/personas/svg?seed=' + encodeURIComponent(decodedName)
        });
      } else {
        // Default mock user if no slug
        setUser({
          name: 'Alex Johnson',
          email: 'alex.johnson@allo.com',
          avatarUrl: 'https://api.dicebear.com/7.x/personas/svg?seed=Alex'
        });
      }
      setLoading(false);
    }, 600); // Simulating API delay
  }, [location]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-3">
        <div className="w-20 h-20 rounded-full bg-gray-200 animate-pulse"></div>
        <div className="h-5 w-40 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 w-52 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex flex-col items-center justify-center space-y-3 transition-all duration-500 ease-out transform animate-fade-in">
      <Avatar className="w-20 h-20 border-2 border-white shadow-lg transition-all duration-300 hover:scale-105">
        <AvatarImage src={user.avatarUrl} alt={user.name} />
        <AvatarFallback className="bg-allo-primary text-white text-lg">
          {user.name.split(' ').map(name => name[0]).join('')}
        </AvatarFallback>
      </Avatar>
      <h2 className="text-xl font-semibold tracking-tight animate-slide-up">{user.name}</h2>
      <p className="text-allo-muted text-sm animate-slide-up opacity-80">{user.email}</p>
    </div>
  );
};

export default UserProfile;
