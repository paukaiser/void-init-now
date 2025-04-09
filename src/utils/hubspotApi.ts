
/**
 * HubSpot API utilities for company search and creation
 */

// Use environment variable or fallback to a placeholder
const HUBSPOT_PRIVATE_APP_TOKEN = "insert your private app token here";
const HUBSPOT_API_BASE_URL = "https://api.hubspot.com";

// Check if API token is properly configured
const isTokenConfigured = () => {
  return HUBSPOT_PRIVATE_APP_TOKEN && HUBSPOT_PRIVATE_APP_TOKEN !== "insert your private app token here";
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

  // Check if token is configured
  if (!isTokenConfigured()) {
    console.error("HubSpot Private App Token is not configured properly. Please replace the placeholder with your actual token.");
    throw new Error("HubSpot token not configured");
  }

  try {
    console.log(`Searching for companies with term: ${searchTerm}`);
    
    // First try to get all companies (for small accounts this is faster)
    const response = await fetch(
      `${HUBSPOT_API_BASE_URL}/crm/v3/objects/companies?limit=100`, 
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${HUBSPOT_PRIVATE_APP_TOKEN}`
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error("HubSpot API error response:", errorData);
      throw new Error(`HubSpot API error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    console.log("HubSpot companies search results:", data);
    
    // Filter the results on the client side by the search term
    const filteredResults = data.results.filter((company: HubspotCompany) => 
      company.properties.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    return filteredResults || [];
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
  // Check if token is configured
  if (!isTokenConfigured()) {
    console.error("HubSpot Private App Token is not configured properly. Please replace the placeholder with your actual token.");
    throw new Error("HubSpot token not configured");
  }

  try {
    console.log("Creating new HubSpot company:", companyData);
    
    const response = await fetch(
      `${HUBSPOT_API_BASE_URL}/crm/v3/objects/companies`, 
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${HUBSPOT_PRIVATE_APP_TOKEN}`
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
