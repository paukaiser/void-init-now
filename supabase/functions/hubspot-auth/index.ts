
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { corsHeaders } from '../_shared/cors.ts';

const HUBSPOT_CLIENT_ID = Deno.env.get('HUBSPOT_CLIENT_ID') || '';
const HUBSPOT_CLIENT_SECRET = Deno.env.get('HUBSPOT_CLIENT_SECRET') || '';
const HUBSPOT_REDIRECT_URI = Deno.env.get('HUBSPOT_REDIRECT_URI') || '';
const HUBSPOT_SCOPES = [
  'crm.objects.contacts.read',
  'crm.objects.companies.read',
  'meetings',
  'timeline'
];

// Create a Supabase client (for logging purposes)
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();

    // Generate auth URL
    if (path === 'get-auth-url') {
      const params = new URLSearchParams({
        client_id: HUBSPOT_CLIENT_ID,
        redirect_uri: HUBSPOT_REDIRECT_URI,
        scope: HUBSPOT_SCOPES.join(' '),
      });
      
      const authUrl = `https://app.hubspot.com/oauth/authorize?${params.toString()}`;
      
      return new Response(JSON.stringify({ 
        url: authUrl 
      }), {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      });
    }
    
    // Exchange code for token
    else if (path === 'exchange-token') {
      const { code } = await req.json();
      
      if (!code) {
        return new Response(JSON.stringify({ error: 'No code provided' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

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

      const data = await response.json();

      if (!response.ok) {
        // Log the error for debugging
        console.error('Error exchanging token:', data);
        return new Response(JSON.stringify({ 
          error: 'Error exchanging code for token',
          details: data
        }), {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Refresh token
    else if (path === 'refresh-token') {
      const { refresh_token } = await req.json();
      
      if (!refresh_token) {
        return new Response(JSON.stringify({ error: 'No refresh token provided' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

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

      const data = await response.json();

      if (!response.ok) {
        console.error('Error refreshing token:', data);
        return new Response(JSON.stringify({ 
          error: 'Error refreshing token',
          details: data
        }), {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Handle user info
    else if (path === 'user-info') {
      const { accessToken } = await req.json();
      
      if (!accessToken) {
        return new Response(JSON.stringify({ error: 'No access token provided' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const response = await fetch('https://api.hubapi.com/integrations/v1/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Error getting user info:', data);
        return new Response(JSON.stringify({ 
          error: 'Error getting user info',
          details: data
        }), {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({ error: 'Invalid endpoint' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error handling request:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
