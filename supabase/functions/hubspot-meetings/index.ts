
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4'
import { corsHeaders } from '../_shared/cors.ts'

// Edge function to call HubSpot API to fetch meetings by owner ID
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { hubspotId } = await req.json()
    
    if (!hubspotId) {
      return new Response(
        JSON.stringify({ error: 'HubSpot ID is required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Get HubSpot API key from environment variable
    const hubspotApiKey = Deno.env.get('HUBSPOT_PRIVATE_APP_KEY')
    if (!hubspotApiKey) {
      return new Response(
        JSON.stringify({ error: 'HubSpot API key not configured' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }

    // Call HubSpot API to get meetings by owner ID
    const response = await fetch(
      `https://api.hubapi.com/crm/v3/objects/meetings?properties=hs_meeting_title,hs_meeting_body,hs_meeting_start_time,hs_meeting_end_time,hs_meeting_location,hs_meeting_outcome&associations=contacts,companies&ownerId=${hubspotId}`,
      {
        headers: {
          'Authorization': `Bearer ${hubspotApiKey}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      console.error('HubSpot API error:', errorData)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch meetings from HubSpot', details: errorData }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: response.status 
        }
      )
    }

    const data = await response.json()

    // Process the data to match the format expected by the frontend
    const meetings = await processMeetingsData(data, hubspotApiKey)

    return new Response(
      JSON.stringify({ meetings }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error in hubspot-meetings edge function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

// Function to process HubSpot API response and format it for the frontend
async function processMeetingsData(data: any, hubspotApiKey: string) {
  const meetings = []

  for (const result of data.results) {
    const properties = result.properties
    const associations = result.associations || {}
    
    // Get contact and company details if available
    let contactName = 'Unknown Contact'
    let companyName = 'Unknown Company'
    let contactAssociation = null
    let companyAssociation = null
    
    // Check if meeting has contact associations
    if (associations.contacts && associations.contacts.results && associations.contacts.results.length > 0) {
      contactAssociation = associations.contacts.results[0]
      // Fetch contact details
      const contactResponse = await fetch(
        `https://api.hubapi.com/crm/v3/objects/contacts/${contactAssociation.id}?properties=firstname,lastname`,
        {
          headers: {
            'Authorization': `Bearer ${hubspotApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      )
      
      if (contactResponse.ok) {
        const contactData = await contactResponse.json()
        const firstName = contactData.properties.firstname || ''
        const lastName = contactData.properties.lastname || ''
        contactName = `${firstName} ${lastName}`.trim() || 'Unknown Contact'
      }
    }
    
    // Check if meeting has company associations
    if (associations.companies && associations.companies.results && associations.companies.results.length > 0) {
      companyAssociation = associations.companies.results[0]
      // Fetch company details
      const companyResponse = await fetch(
        `https://api.hubapi.com/crm/v3/objects/companies/${companyAssociation.id}?properties=name,address`,
        {
          headers: {
            'Authorization': `Bearer ${hubspotApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      )
      
      if (companyResponse.ok) {
        const companyData = await companyResponse.json()
        companyName = companyData.properties.name || 'Unknown Company'
        
        // Add address if available
        const address = companyData.properties.address || null
        
        meetings.push({
          id: result.id,
          title: properties.hs_meeting_title || 'Untitled Meeting',
          contactName: contactName,
          companyName: companyName,
          startTime: properties.hs_meeting_start_time,
          endTime: properties.hs_meeting_end_time,
          date: new Date(properties.hs_meeting_start_time).toLocaleDateString('en-US', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }).replace(/\//g, '.'),
          type: 'sales meeting',
          status: properties.hs_meeting_outcome === 'COMPLETED' ? 'completed' : 'scheduled',
          address: address
        })
      }
    } else {
      // If no company association, still add the meeting
      meetings.push({
        id: result.id,
        title: properties.hs_meeting_title || 'Untitled Meeting',
        contactName: contactName,
        companyName: companyName,
        startTime: properties.hs_meeting_start_time,
        endTime: properties.hs_meeting_end_time,
        date: new Date(properties.hs_meeting_start_time).toLocaleDateString('en-US', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }).replace(/\//g, '.'),
        type: 'sales meeting',
        status: properties.hs_meeting_outcome === 'COMPLETED' ? 'completed' : 'scheduled'
      })
    }
  }

  return meetings
}
