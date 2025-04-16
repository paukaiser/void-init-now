
import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "sonner";

export function useHubspotApi() {
  const { user, refreshAuthToken, logout } = useAuth();
  
  const fetchWithAuth = useCallback(async (
    url: string,
    options?: RequestInit
  ) => {
    if (!user) {
      throw new Error('Not authenticated');
    }
    
    try {
      // Check if token is about to expire (within 1 minute)
      let accessToken = user.accessToken;
      if (user.expiresAt - Date.now() < 60 * 1000) {
        const newToken = await refreshAuthToken();
        if (!newToken) {
          throw new Error('Failed to refresh token');
        }
        accessToken = newToken;
      }
      
      // Make the API request
      const response = await fetch(url, {
        ...options,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          ...(options?.headers || {}),
        },
      });
      
      // Handle 401 Unauthorized (token expired)
      if (response.status === 401) {
        // Try to refresh token
        const newToken = await refreshAuthToken();
        if (!newToken) {
          throw new Error('Session expired');
        }
        
        // Retry with new token
        return fetch(url, {
          ...options,
          headers: {
            Authorization: `Bearer ${newToken}`,
            'Content-Type': 'application/json',
            ...(options?.headers || {}),
          },
        });
      }
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('API call failed:', error);
      if (error instanceof Error && error.message.includes('Session expired')) {
        toast.error('Your session has expired. Please log in again.');
        logout();
      }
      throw error;
    }
  }, [user, refreshAuthToken, logout]);
  
  return { fetchWithAuth };
}
