import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { corsHeaders } from "../_shared/cors.ts";

const HUBSPOT_CLIENT_ID = Deno.env.get("HUBSPOT_CLIENT_ID") || "";
const HUBSPOT_CLIENT_SECRET = Deno.env.get("HUBSPOT_CLIENT_SECRET") || "";
const HUBSPOT_REDIRECT_URI = Deno.env.get("HUBSPOT_REDIRECT_URI") || "";
const HUBSPOT_SCOPES = [
  "crm.objects.contacts.read",
  "crm.objects.companies.read",
];

// Create a Supabase client (for logging purposes)
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.split("/").pop();

    // Generate auth URL
    if (path === "get-auth-url") {
      const params = new URLSearchParams({
        client_id: HUBSPOT_CLIENT_ID,
        redirect_uri: HUBSPOT_REDIRECT_URI,
        scope: HUBSPOT_SCOPES.join(" "),
      });

      const authUrl =
        `https://app.hubspot.com/oauth/authorize?${params.toString()}`;

      return new Response(
        JSON.stringify({
          url: authUrl,
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    } else if (path === "exchange-token") {
      const { code } = await req.json();

      if (!code) {
        return new Response(JSON.stringify({ error: "No code provided" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const params = new URLSearchParams({
        client_id: HUBSPOT_CLIENT_ID,
        client_secret: HUBSPOT_CLIENT_SECRET,
        redirect_uri: HUBSPOT_REDIRECT_URI,
        grant_type: "authorization_code",
        code,
      });

      const response = await fetch("https://api.hubapi.com/oauth/v1/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });

      const tokenData = await response.json();

      if (!response.ok) {
        console.error("Error exchanging token:", tokenData);
        return new Response(
          JSON.stringify({
            error: "Error exchanging code for token",
            details: tokenData,
          }),
          {
            status: response.status,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      // ✅ NEW: Fetch user info using the access token
      const userInfoRes = await fetch(
        "https://api.hubapi.com/oauth/v1/access-tokens/" +
          tokenData.access_token,
        {
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
          },
        },
      );

      const userInfo = await userInfoRes.json();

      if (!userInfoRes.ok) {
        console.error("Error fetching user info:", userInfo);
        return new Response(
          JSON.stringify({
            error: "Error fetching user info",
            details: userInfo,
          }),
          {
            status: userInfoRes.status,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      // ✅ Combine token + user info into one response
      return new Response(
        JSON.stringify({
          ...tokenData,
          user_id: userInfo.user_id,
          user_email: userInfo.user,
          hub_id: userInfo.hub_id,
          hub_domain: userInfo.hub_domain,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
