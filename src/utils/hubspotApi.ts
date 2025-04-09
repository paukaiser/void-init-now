
/**
 * HubSpot API utilities for company search and creation
 */

const HUBSPOT_API_KEY = "insert your api key here";
const HUBSPOT_API_BASE_URL = "https://api.hubapi.com";

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

  try {
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
      throw new Error(`HubSpot API error: ${response.status}`);
    }

    const data = await response.json();
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
  try {
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
      throw new Error(`HubSpot API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating HubSpot company:", error);
    throw error;
  }
};
