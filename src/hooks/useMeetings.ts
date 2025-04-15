
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Meeting } from '@/components/MeetingCard';
import { format } from 'date-fns';

interface UserProfile {
  hubspot_id: string | null;
}

async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('hubspot_id')
    .eq('id', userId)
    .single();
    
  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
  
  return data;
}

async function fetchMeetingsFromHubSpot(hubspotId: string): Promise<Meeting[]> {
  const response = await fetch(
    `${supabase.supabaseUrl}/functions/v1/hubspot-meetings`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabase.supabaseKey}`
      },
      body: JSON.stringify({ hubspotId })
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Error fetching meetings from HubSpot:', errorData);
    throw new Error(`Failed to fetch meetings: ${errorData.error || response.statusText}`);
  }

  const data = await response.json();
  return data.meetings;
}

// Fallback function to generate mock meetings when HubSpot is not available
function generateMockMeetings(): Meeting[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const meetingTime1 = new Date(today);
  meetingTime1.setHours(9, 0, 0);
  
  const meetingTime2 = new Date(today);
  meetingTime2.setHours(11, 30, 0);
  
  const meetingTime3 = new Date(today);
  meetingTime3.setHours(13, 45, 0);
  
  const meetingTime4 = new Date(today);
  meetingTime4.setHours(16, 0, 0);
  
  return [
    {
      id: '1',
      title: 'Product Demo',
      contactName: 'Sarah Chen',
      companyName: 'Acme Inc',
      startTime: meetingTime1.toISOString(),
      endTime: new Date(meetingTime1.getTime() + 60 * 60 * 1000).toISOString(),
      date: format(today, 'dd.MM.yyyy'),
      type: 'sales meeting',
      status: 'scheduled',
      address: '123 Main St, San Francisco, CA'
    },
    {
      id: '2',
      title: 'Contract Discussion',
      contactName: 'Michael Rodriguez',
      companyName: 'Global Tech',
      startTime: meetingTime2.toISOString(),
      endTime: new Date(meetingTime2.getTime() + 40 * 60 * 1000).toISOString(),
      date: format(today, 'dd.MM.yyyy'),
      type: 'sales followup',
      status: 'completed',
      address: '456 Market St, San Francisco, CA'
    },
    {
      id: '3',
      title: 'Initial Consultation',
      contactName: 'David Park',
      companyName: 'Innovate Solutions',
      startTime: meetingTime3.toISOString(),
      endTime: new Date(meetingTime3.getTime() + 2 * 60 * 60 * 1000).toISOString(),
      date: format(today, 'dd.MM.yyyy'),
      type: 'sales meeting',
      status: 'scheduled',
      address: '789 Mission St, San Francisco, CA'
    },
    {
      id: '4',
      title: 'Product Roadmap',
      contactName: 'Emma Watson',
      companyName: 'Tech Forward',
      startTime: meetingTime4.toISOString(),
      endTime: new Date(meetingTime4.getTime() + 75 * 60 * 1000).toISOString(),
      date: format(today, 'dd.MM.yyyy'),
      type: 'sales followup',
      status: 'rescheduled',
      address: '101 Howard St, San Francisco, CA'
    }
  ];
}

export function useMeetings() {
  const { user } = useAuth();
  const [hubspotId, setHubspotId] = useState<string | null>(null);
  
  // First query to fetch the user's profile with HubSpot ID
  const profileQuery = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      return fetchUserProfile(user.id);
    },
    enabled: !!user
  });
  
  // Set hubspotId when profile is successfully fetched
  useEffect(() => {
    if (profileQuery.data) {
      setHubspotId(profileQuery.data.hubspot_id);
    }
  }, [profileQuery.data]);
  
  // Second query to fetch meetings from HubSpot
  const meetingsQuery = useQuery({
    queryKey: ['meetings', hubspotId],
    queryFn: async () => {
      if (!hubspotId) {
        console.log('No HubSpot ID available, using mock data');
        return generateMockMeetings();
      }
      
      try {
        return await fetchMeetingsFromHubSpot(hubspotId);
      } catch (error) {
        console.error('Error in fetchMeetingsFromHubSpot, falling back to mock data:', error);
        return generateMockMeetings();
      }
    },
    enabled: profileQuery.isSuccess,
    retry: 1 // Limit retries to prevent excessive calls on failure
  });

  return {
    meetings: meetingsQuery.data || [],
    isLoading: profileQuery.isLoading || meetingsQuery.isLoading,
    isError: profileQuery.isError || meetingsQuery.isError,
    error: profileQuery.error || meetingsQuery.error,
    refetch: () => {
      profileQuery.refetch();
      meetingsQuery.refetch();
    }
  };
}
