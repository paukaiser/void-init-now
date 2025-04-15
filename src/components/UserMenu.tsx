
import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  hubspot_id: string | null;
}

const UserMenu: React.FC = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  
  useEffect(() => {
    if (user) {
      // Fetch user profile including hubspot_id
      const fetchUserProfile = async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('hubspot_id')
          .eq('id', user.id)
          .single();
          
        if (!error && data) {
          setProfile(data);
        }
      };
      
      fetchUserProfile();
    }
  }, [user]);
  
  if (!user) return null;
  
  return (
    <div className="relative flex items-center gap-2">
      <div className="flex flex-col items-end">
        <span className="text-sm font-medium">{user.email}</span>
        {profile?.hubspot_id && (
          <span className="text-xs text-gray-500">HubSpot ID: {profile.hubspot_id}</span>
        )}
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
