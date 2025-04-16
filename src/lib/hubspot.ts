import { supabase } from '@/integrations/supabase/client';

// Constants for Hubspot OAuth - these will now come from the edge function
export const HUBSPOT_REDIRECT_URI = import.meta.env.VITE_HUBSPOT_REDIRECT_URI || `${window.location.origin}/oauth-callback`;

// Get authorization URL for Hubspot OAuth
export async function getAuthUrl(): Promise<string> {
  try {
    const { data, error } = await supabase.functions.invoke('hubspot-auth/get-auth-url');
    
    if (error) {
      console.error('Error getting auth URL:', error);
      throw new Error('Failed to get authentication URL');
    }
    
    return data.url;
  } catch (error) {
    console.error('Error calling auth URL function:', error);
    throw error;
  }
}

// Exchange authorization code for access token
export async function getAccessToken(code: string): Promise<any> {
  try {
    const { data, error } = await supabase.functions.invoke('hubspot-auth/exchange-token', {
      body: { code }
    });
    
    if (error) {
      console.error('Error exchanging code for token:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    throw error;
  }
}

// Refresh access token
export async function refreshToken(refresh_token: string): Promise<any> {
  try {
    const { data, error } = await supabase.functions.invoke('hubspot-auth/refresh-token', {
      body: { refresh_token }
    });
    
    if (error) {
      console.error('Error refreshing token:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
}

// Get user info from Hubspot
export async function getUserInfo(accessToken: string): Promise<any> {
  try {
    const { data, error } = await supabase.functions.invoke('hubspot-auth/user-info', {
      body: { accessToken }
    });
    
    if (error) {
      console.error('Error getting user info:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error getting user info:', error);
    throw error;
  }
}

// Fetch user's meetings from Hubspot
export async function fetchUserMeetings(accessToken: string): Promise<any> {
  try {
    const response = await fetch('https://api.hubapi.com/calendar/v1/events', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching meetings:', error);
    throw error;
  }
}
