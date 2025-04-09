
/**
 * HubSpot API utilities for company search and creation
 */

// Use environment variable or fallback to a placeholder
const HUBSPOT_API_KEY = "insert your api key here";
const HUBSPOT_API_BASE_URL = "https://api.hubapi.com";

// Check if API key is properly configured
const isApiKeyConfigured = () => {
  return HUBSPOT_API_KEY && HUBSPOT_API_KEY !== "insert your api key here";
};

export interface HubspotCompany {
  id: string;
  properties: {
    name: string;
    address?: string;
    city?: string;
    zip?: string;
    country?: string;
    phone?: string;
    domain?: string;
    industry?: string;
    // Add more properties as needed
  };
}

/**
 * Search for companies in HubSpot by name
 */
export const searchHubspotCompanies = async (searchTerm: string): Promise<HubspotCompany[]> => {
  if (!searchTerm || searchTerm.length < 2) {
    return [];
  }

  // Check if API key is configured
  if (!isApiKeyConfigured()) {
    console.error("HubSpot API key is not configured properly. Please replace 'insert your api key here' with your actual API key.");
    throw new Error("HubSpot API key not configured");
  }

  try {
    console.log(`Searching for companies with term: ${searchTerm}`);
    
    const response = await fetch(
      `${HUBSPOT_API_BASE_URL}/crm/v3/objects/companies/search`, 
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${HUBSPOT_API_KEY}`
        },
        body: JSON.stringify({
          filterGroups: [
            {
              filters: [
                {
                  propertyName: 'name',
                  operator: 'CONTAINS_TOKEN',
                  value: searchTerm
                }
              ]
            }
          ],
          properties: ['name', 'address', 'city', 'zip', 'country', 'phone', 'domain', 'industry'],
          limit: 5
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error("HubSpot API error response:", errorData);
      throw new Error(`HubSpot API error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    console.log("HubSpot companies search results:", data);
    return data.results || [];
  } catch (error) {
    console.error("Error searching HubSpot companies:", error);
    throw error;
  }
};

/**
 * Create a new company in HubSpot
 */
export const createHubspotCompany = async (companyData: { 
  name: string; 
  address?: string;
  city?: string;
  country?: string;
  phone?: string;
}): Promise<HubspotCompany> => {
  // Check if API key is configured
  if (!isApiKeyConfigured()) {
    console.error("HubSpot API key is not configured properly. Please replace 'insert your api key here' with your actual API key.");
    throw new Error("HubSpot API key not configured");
  }

  try {
    console.log("Creating new HubSpot company:", companyData);
    
    const response = await fetch(
      `${HUBSPOT_API_BASE_URL}/crm/v3/objects/companies`, 
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${HUBSPOT_API_KEY}`
        },
        body: JSON.stringify({
          properties: {
            name: companyData.name,
            address: companyData.address || '',
            city: companyData.city || '',
            country: companyData.country || '',
            phone: companyData.phone || ''
          }
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error("HubSpot API error response:", errorData);
      throw new Error(`HubSpot API error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Created HubSpot company:", data);
    return data;
  } catch (error) {
    console.error("Error creating HubSpot company:", error);
    throw error;
  }
};
