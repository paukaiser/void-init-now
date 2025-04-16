
import { useAuth } from '@/contexts/AuthContext';

// Helper function to create authenticated API call with refresh token handling
export async function hubspotFetch(url: string, options?: RequestInit): Promise<Response> {
  const auth = useAuth();
  
  try {
    // Get current access token or refresh if needed
    let accessToken = auth.user?.accessToken;
    
    // Check if token is about to expire (within 1 minute)
    if (auth.user && auth.user.expiresAt - Date.now() < 60 * 1000) {
      accessToken = await auth.refreshAuthToken();
      if (!accessToken) {
        throw new Error('Failed to refresh access token');
      }
    }
    
    // Make the request
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
    });
    
    // Handle 401 Unauthorized
    if (response.status === 401) {
      // Try to refresh the token
      const refreshedToken = await auth.refreshAuthToken();
      if (!refreshedToken) {
        throw new Error('Session expired');
      }
      
      // Retry the request with the new token
      return fetch(url, {
        ...options,
        headers: {
          Authorization: `Bearer ${refreshedToken}`,
          'Content-Type': 'application/json',
          ...(options?.headers || {}),
        },
      });
    }
    
    return response;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

// Specific API endpoints using the authenticated fetch
export async function searchCompanies(term: string) {
  const url = 'https://api.hubapi.com/crm/v3/objects/companies/search';
  
  const body = JSON.stringify({
    filterGroups: [
      {
        filters: [
          {
            propertyName: 'name',
            operator: 'CONTAINS_TOKEN',
            value: term,
          },
        ],
      },
    ],
    properties: ['name', 'address', 'city', 'state', 'zip'],
    limit: 10,
  });
  
  const response = await hubspotFetch(url, {
    method: 'POST',
    body,
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  return response.json();
}

export async function getContactsByCompany(companyId: string) {
  const url = `https://api.hubapi.com/crm/v3/objects/contacts/search`;
  
  const body = JSON.stringify({
    filterGroups: [
      {
        filters: [
          {
            propertyName: 'associatedcompanyid',
            operator: 'EQ',
            value: companyId,
          },
        ],
      },
    ],
    properties: ['firstname', 'lastname', 'email', 'phone', 'mobilephone'],
    limit: 10,
  });
  
  const response = await hubspotFetch(url, {
    method: 'POST',
    body,
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  return response.json();
}

export async function createContact(contact: any, companyId?: string) {
  const url = 'https://api.hubapi.com/crm/v3/objects/contacts';
  
  const properties = {
    firstname: contact.firstName,
    lastname: contact.lastName,
    email: contact.email,
  };
  
  if (contact.phone) {
    properties['phone'] = contact.phone;
  }
  
  if (contact.mobilePhone) {
    properties['mobilephone'] = contact.mobilePhone;
  }
  
  const body: any = {
    properties,
  };
  
  // If companyId is provided, associate the contact with the company
  if (companyId) {
    body.associations = [
      {
        to: {
          id: companyId,
        },
        types: [
          {
            associationCategory: 'HUBSPOT_DEFINED',
            associationTypeId: 1, // 1 is the ID for contact_to_company association
          },
        ],
      },
    ];
  }
  
  const response = await hubspotFetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  return response.json();
}

export async function getUserMeetings() {
  // Note: The exact endpoint might be different based on HubSpot's API for meetings
  const url = 'https://api.hubapi.com/calendar/v1/events';
  
  const response = await hubspotFetch(url);
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  return response.json();
}
