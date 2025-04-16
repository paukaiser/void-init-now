
import { createClient } from '@supabase/supabase-js';

// Constants for Hubspot OAuth
export const HUBSPOT_REDIRECT_URI = import.meta.env.VITE_HUBSPOT_REDIRECT_URI || `${window.location.origin}/oauth-callback`;

// Create a Supabase client for API calls
const supabaseUrl = 'https://migsumagxwcavneegjtz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pZ3N1bWFneHdjYXZuZWVnanR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3OTIwNjcsImV4cCI6MjA2MDM2ODA2N30.Ta4MX6VtyBg6r8hLm4ckHDroTnzJ-NAUjlGi0w03gPI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Get authorization URL for Hubspot OAuth
export async function getAuthUrl(): Promise<string> {
  try {
    console.log('Getting HubSpot auth URL from Edge Function');
    const { data, error } = await supabase.functions.invoke('hubspot-auth/get-auth-url');
    
    if (error) {
      console.error('Error getting auth URL:', error);
      throw new Error('Failed to get authentication URL: ' + error.message);
    }
    
    if (!data || !data.url) {
      console.error('Invalid auth URL response:', data);
      throw new Error('Invalid authentication URL response');
    }
    
    console.log('Auth URL received:', data.url);
    return data.url;
  } catch (error) {
    console.error('Error calling auth URL function:', error);
    throw error;
  }
}

// Exchange authorization code for access token
export async function getAccessToken(code: string): Promise<any> {
  try {
    console.log('Exchanging code for token through the edge function...');
    const { data, error } = await supabase.functions.invoke('hubspot-auth/exchange-token', {
      body: { code }
    });
    
    if (error) {
      console.error('Error exchanging code for token:', error);
      throw error;
    }
    
    if (!data) {
      console.error('No data returned when exchanging code for token');
      throw new Error('No data returned when exchanging code for token');
    }
    
    console.log('Token exchange successful');
    return data;
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    throw error;
  }
}

// Refresh access token
export async function refreshToken(refresh_token: string): Promise<any> {
  try {
    console.log('Refreshing token through the edge function...');
    const { data, error } = await supabase.functions.invoke('hubspot-auth/refresh-token', {
      body: { refresh_token }
    });
    
    if (error) {
      console.error('Error refreshing token:', error);
      throw error;
    }
    
    if (!data) {
      console.error('No data returned when refreshing token');
      throw new Error('No data returned when refreshing token');
    }
    
    console.log('Token refresh successful:', data);
    return data;
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
}

// Get user info from Hubspot
export async function getUserInfo(accessToken: string): Promise<any> {
  try {
    console.log('Getting user info from edge function...');
    const { data, error } = await supabase.functions.invoke('hubspot-auth/user-info', {
      body: { accessToken }
    });
    
    if (error) {
      console.error('Error getting user info:', error);
      throw error;
    }
    
    console.log('User info retrieved successfully');
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
