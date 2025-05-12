
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || 'https://rzuupvxigzdvnwlrcevo.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const CLIENT_ID = Deno.env.get('HUBSPOT_CLIENT_ID') || ''
const CLIENT_SECRET = Deno.env.get('HUBSPOT_CLIENT_SECRET') || ''
const REDIRECT_URI = Deno.env.get('HUBSPOT_REDIRECT_URI') || 'https://rzuupvxigzdvnwlrcevo.supabase.co/functions/v1/hubspot-callback'
const SCOPES = Deno.env.get('HUBSPOT_SCOPES') || 'contacts%20crm.objects.custom.read%20crm.objects.custom.write%20crm.objects.deals.read%20crm.objects.deals.write%20crm.objects.marketing_events.read%20crm.schemas.deals.read%20e-commerce%20files%20forms%20forms-uploaded-files%20tickets'
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
    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Get the user's session from the request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      const redirectUrl = `${FRONTEND_URL}?error=not_authenticated`
      return new Response(null, {
        status: 302,
        headers: { ...corsHeaders, 'Location': redirectUrl }
      })
    }

    const token = authHeader.split(' ')[1]
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)

    if (userError || !user) {
      console.error('Authentication error:', userError)
      const redirectUrl = `${FRONTEND_URL}?error=invalid_token`
      return new Response(null, {
        status: 302,
        headers: { ...corsHeaders, 'Location': redirectUrl }
      })
    }

    // Generate HubSpot OAuth URL
    const state = btoa(JSON.stringify({ userId: user.id }))
    const hubspotAuthUrl = `https://app.hubspot.com/oauth/authorize?client_id=${CLIENT_ID}&scope=${SCOPES}&redirect_uri=${REDIRECT_URI}&state=${state}`

    // Redirect to HubSpot OAuth page
    return new Response(null, {
      status: 302,
      headers: { ...corsHeaders, 'Location': hubspotAuthUrl }
    })
  } catch (error) {
    console.error('HubSpot auth error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
