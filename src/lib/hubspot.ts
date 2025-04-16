
// Constants for Hubspot OAuth
export const HUBSPOT_CLIENT_ID = import.meta.env.VITE_HUBSPOT_CLIENT_ID || '';
export const HUBSPOT_CLIENT_SECRET = import.meta.env.VITE_HUBSPOT_CLIENT_SECRET || '';
export const HUBSPOT_REDIRECT_URI = import.meta.env.VITE_HUBSPOT_REDIRECT_URI || `${window.location.origin}/oauth-callback`;
export const HUBSPOT_SCOPES = [
  'crm.objects.contacts.read',
  'crm.objects.companies.read',
  'meetings',
  'timeline'
];

// Get authorization URL for Hubspot OAuth
export function getAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: HUBSPOT_CLIENT_ID,
    redirect_uri: HUBSPOT_REDIRECT_URI,
    scope: HUBSPOT_SCOPES.join(' '),
  });
  
  return `https://app.hubspot.com/oauth/authorize?${params.toString()}`;
}

// Exchange authorization code for access token
export async function getAccessToken(code: string): Promise<any> {
  try {
    // In a production app, this should be done server-side to protect client_secret
    // For demo purposes only, we're doing this in the browser
    const params = new URLSearchParams({
      client_id: HUBSPOT_CLIENT_ID,
      client_secret: HUBSPOT_CLIENT_SECRET,
      redirect_uri: HUBSPOT_REDIRECT_URI,
      grant_type: 'authorization_code',
      code,
    });
    
    const response = await fetch('https://api.hubapi.com/oauth/v1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    throw error;
  }
}

// Refresh access token
export async function refreshToken(refresh_token: string): Promise<any> {
  try {
    const params = new URLSearchParams({
      client_id: HUBSPOT_CLIENT_ID,
      client_secret: HUBSPOT_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token,
    });
    
    const response = await fetch('https://api.hubapi.com/oauth/v1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
}

// Get user info from Hubspot
export async function getUserInfo(accessToken: string): Promise<any> {
  try {
    const response = await fetch('https://api.hubapi.com/integrations/v1/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting user info:', error);
    throw error;
  }
}

// Fetch user's meetings from Hubspot
export async function fetchUserMeetings(accessToken: string): Promise<any> {
  try {
    // This is a placeholder - the actual Hubspot API endpoint for meetings may be different
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
