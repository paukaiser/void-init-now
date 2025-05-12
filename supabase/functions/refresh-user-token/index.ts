
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle preflight CORS
Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  // Check if the request is authenticated
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
      status: 401, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
  
  try {
    // Parse request body
    const body = await req.json();
    const { userId } = body;
    
    if (!userId) {
      return new Response(JSON.stringify({ error: 'Missing userId parameter' }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }
    
    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );
    
    // Verify the user's JWT from the Authorization header
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      console.error("Auth error:", authError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }
    
    // Check if the authenticated user matches the requested userId
    if (user.id !== userId) {
      return new Response(JSON.stringify({ error: 'Forbidden - Can only refresh your own token' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Get the current OAuth token for the user
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from('user_hubspot_tokens')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (tokenError || !tokenData) {
      console.error("Token fetch error:", tokenError);
      return new Response(JSON.stringify({ error: 'OAuth token not found for user' }), { 
        status: 404, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }
    
    // Check if token is expired
    if (new Date(tokenData.expires_at) > new Date()) {
      return new Response(JSON.stringify({ 
        message: 'Token still valid',
        token: tokenData.access_token,
        expires_at: tokenData.expires_at
      }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }
    
    // Refresh the token using HubSpot API
    const hubspotTokenUrl = 'https://api.hubapi.com/oauth/v1/token';
    const refreshParams = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: Deno.env.get('HUBSPOT_CLIENT_ID') || '',
      client_secret: Deno.env.get('HUBSPOT_CLIENT_SECRET') || '',
      refresh_token: tokenData.refresh_token,
    });
    
    const response = await fetch(hubspotTokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: refreshParams.toString(),
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error("HubSpot refresh error:", errorData);
      return new Response(JSON.stringify({ error: 'Failed to refresh token', details: errorData }), { 
        status: 502, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }
    
    const freshTokens = await response.json();
    
    // Calculate expiry time (tokens are typically valid for 6 hours)
    const expiryTime = new Date();
    expiryTime.setSeconds(expiryTime.getSeconds() + freshTokens.expires_in);
    
    // Update token in Supabase
    const { error: updateError } = await supabaseAdmin
      .from('user_hubspot_tokens')
      .update({
        access_token: freshTokens.access_token,
        refresh_token: freshTokens.refresh_token || tokenData.refresh_token, // Use new refresh token if provided
        expires_at: expiryTime.toISOString(),
      })
      .eq('user_id', userId);
      
    if (updateError) {
      console.error("Token update error:", updateError);
      return new Response(JSON.stringify({ error: 'Failed to update token in database' }), { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }
    
    return new Response(JSON.stringify({
      message: 'Token refreshed successfully',
      token: freshTokens.access_token,
      expires_at: expiryTime.toISOString()
    }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
    
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: 'Internal server error', details: err.message }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});
