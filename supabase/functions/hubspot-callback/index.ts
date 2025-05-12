
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || 'https://rzuupvxigzdvnwlrcevo.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const CLIENT_ID = Deno.env.get('HUBSPOT_CLIENT_ID') || ''
const CLIENT_SECRET = Deno.env.get('HUBSPOT_CLIENT_SECRET') || ''
const REDIRECT_URI = Deno.env.get('HUBSPOT_REDIRECT_URI') || 'https://rzuupvxigzdvnwlrcevo.supabase.co/functions/v1/hubspot-callback'
const FRONTEND_URL = Deno.env.get('FRONTEND_URL') || 'http://localhost:5173'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get URL parameters
    const url = new URL(req.url)
    const code = url.searchParams.get('code')
    const stateParam = url.searchParams.get('state')
    const error = url.searchParams.get('error')

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Handle OAuth errors
    if (error) {
      console.error('HubSpot OAuth error:', error)
      return new Response(null, {
        status: 302,
        headers: { ...corsHeaders, 'Location': `${FRONTEND_URL}?error=${error}` }
      })
    }

    // Validate required parameters
    if (!code || !stateParam) {
      console.error('Missing required OAuth parameters')
      return new Response(null, {
        status: 302,
        headers: { ...corsHeaders, 'Location': `${FRONTEND_URL}?error=missing_params` }
      })
    }

    // Parse state to get user ID
    let userId
    try {
      const stateObj = JSON.parse(atob(stateParam))
      userId = stateObj.userId
    } catch (e) {
      console.error('Invalid state parameter:', e)
      return new Response(null, {
        status: 302,
        headers: { ...corsHeaders, 'Location': `${FRONTEND_URL}?error=invalid_state` }
      })
    }

    // Exchange code for token
    const tokenUrl = 'https://api.hubapi.com/oauth/v1/token'
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      code,
    })

    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      body: params,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      console.error('Token exchange error:', errorData)
      return new Response(null, {
        status: 302,
        headers: { ...corsHeaders, 'Location': `${FRONTEND_URL}?error=token_exchange_failed` }
      })
    }

    const tokenData = await tokenResponse.json()

    // Get HubSpot user info
    const userInfoResponse = await fetch(
      `https://api.hubapi.com/oauth/v1/access-tokens/${tokenData.access_token}`,
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      }
    )

    if (!userInfoResponse.ok) {
      console.error('Failed to fetch HubSpot user info')
      return new Response(null, {
        status: 302,
        headers: { ...corsHeaders, 'Location': `${FRONTEND_URL}?error=user_info_failed` }
      })
    }

    const userInfo = await userInfoResponse.json()
    const hubspotUserId = userInfo.user_id

    // Store token in Supabase
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
    
    const { error: tokenInsertError } = await supabase
      .from('user_hubspot_tokens')
      .upsert({
        user_id: userId,
        hubspot_user_id: hubspotUserId,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: expiresAt
      })

    if (tokenInsertError) {
      console.error('Error storing token:', tokenInsertError)
      return new Response(null, {
        status: 302,
        headers: { ...corsHeaders, 'Location': `${FRONTEND_URL}?error=token_storage_failed` }
      })
    }

    // Redirect back to frontend with success
    return new Response(null, {
      status: 302,
      headers: { ...corsHeaders, 'Location': `${FRONTEND_URL}?success=true` }
    })
  } catch (error) {
    console.error('HubSpot callback error:', error)
    return new Response(null, {
      status: 302,
      headers: { ...corsHeaders, 'Location': `${FRONTEND_URL}?error=server_error` }
    })
  }
})
