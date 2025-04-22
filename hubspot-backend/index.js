// index.js
import dotenv from 'dotenv';
dotenv.config();
console.log('CLIENT_ID:', process.env.CLIENT_ID);
console.log('CLIENT_SECRET:', process.env.CLIENT_SECRET);
console.log('REDIRECT_URI:', process.env.REDIRECT_URI);
console.log('SCOPES:', process.env.SCOPES);
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('PORT:', process.env.PORT);

import express from 'express';
import session from 'express-session';
import cors from 'cors';
import axios from 'axios';
import { Client } from '@hubspot/api-client';
import process from "node:process";

const app = express();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const SCOPES = process.env.SCOPES;
const FRONTEND_URL = process.env.FRONTEND_URL;

app.use(express.json());

app.use(session({
  secret: 'hubspot_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    sameSite: 'lax'
  }
}));

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:8080'],
  credentials: true
}));

// 🔐 Login
app.get('/auth/login', (req, res) => {
  const authUrl = `https://app.hubspot.com/oauth/authorize?client_id=${CLIENT_ID}&scope=${SCOPES}&redirect_uri=${REDIRECT_URI}`;
  res.redirect(authUrl);
});

// ✅ Auth Callback
app.get('/auth/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send('Missing code');

  try {
    const tokenRes = await axios.post('https://api.hubapi.com/oauth/v1/token', null, {
      params: {
        grant_type: 'authorization_code',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        code
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    req.session.accessToken = tokenRes.data.access_token;
    res.redirect(FRONTEND_URL);
  } catch (err) {
    console.error("❌ Token exchange failed:", err.response?.data || err.message);
    res.status(500).send('Token exchange failed');
  }
});

// ✅ Check if logged in
app.get('/api/hubspot-data', (req, res) => {
  if (req.session.accessToken) {
    res.status(200).json({ authenticated: true });
  } else {
    res.status(401).json({ authenticated: false });
  }
});

// ✅ Get user info
app.get('/api/me', async (req, res) => {
  const token = req.session.accessToken;
  if (!token) return res.status(401).send('Not authenticated');

  try {
    const meRes = await axios.get('https://api.hubapi.com/oauth/v1/access-tokens/' + token, {
      headers: { Authorization: `Bearer ${token}` }
    });

    res.json({
      user_id: meRes.data.user_id,
      hubId: meRes.data.hub_id,
      name: meRes.data.user,
      email: meRes.data.user_email
    });
  } catch (err) {
    console.error("❌ Failed to fetch HubSpot user:", err.response?.data || err.message);
    res.status(500).send('Could not retrieve user info');
  }
});

// ✅ Get meetings by user
app.post('/api/meetings', async (req, res) => {
  const token = req.session.accessToken;
  if (!token) return res.status(401).send('Not authenticated');

  const { ownerId, startTime, endTime } = req.body;
  const hubspotClient = new Client({ accessToken: token });

  try {
    // Step 1: Fetch all meetings for user
    const response = await hubspotClient.crm.objects.meetings.searchApi.doSearch({
      filterGroups: [{
        filters: [
          { propertyName: "hubspot_owner_id", operator: "EQ", value: ownerId },
          { propertyName: "hs_meeting_start_time", operator: "GTE", value: startTime },
          { propertyName: "hs_meeting_start_time", operator: "LTE", value: endTime }
        ]
      }],
      properties: [
        "hs_meeting_title",
        "hs_meeting_start_time",
        "hs_meeting_end_time",
        "hs_meeting_location",
        "hs_meeting_outcome",
        "hs_activity_type"
      ],
      limit: 50
    });

    const results = await Promise.all(
      response.results.map(async (meeting) => {
        const meetingId = meeting.id;

        // Fetch associations
        const assocRes = await hubspotClient.crm.objects.meetings.associationsApi.getAll(meetingId, 'contacts');
        const companyRes = await hubspotClient.crm.objects.meetings.associationsApi.getAll(meetingId, 'companies');

        const contactId = assocRes.results[0]?.id;
        const companyId = companyRes.results[0]?.id;

        let contactName = "Unknown";
        let companyName = "Unknown";

        if (contactId) {
          const contact = await hubspotClient.crm.contacts.basicApi.getById(contactId, ["firstname", "lastname"]);
          contactName = `${contact.properties.firstname} ${contact.properties.lastname}`;
        }

        if (companyId) {
          const company = await hubspotClient.crm.companies.basicApi.getById(companyId, ["name"]);
          companyName = company.properties.name;
        }

        return {
          id: meetingId,
          title: meeting.properties.hs_meeting_title,
          startTime: meeting.properties.hs_meeting_start_time,
          endTime: meeting.properties.hs_meeting_end_time,
          date: new Date(Number(meeting.properties.hs_meeting_start_time)).toLocaleDateString("de-DE"),
          address: meeting.properties.hs_meeting_location,
          status: meeting.properties.hs_meeting_outcome,
          type: meeting.properties.hs_activity_type,
          contactName,
          companyName
        };
      })
    );

    res.json({ results });
  } catch (err) {
    console.error("❌ Failed to fetch enhanced meetings:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch meetings" });
  }
});


// ✅ Get one meeting by ID
app.get('/api/meeting/:id', async (req, res) => {
  const token = req.session.accessToken;
  if (!token) return res.status(401).send('Not authenticated');

  const meetingId = req.params.id;

  const hubspotClient = new Client({ accessToken: token });

  try {
    const result = await hubspotClient.crm.objects.meetings.basicApi.getById(meetingId, [
      "hs_meeting_title",
      "hs_meeting_start_time",
      "hs_meeting_end_time",
      "hs_meeting_location",
      "hs_meeting_outcome",
      "hs_activity_type"
    ]);

    res.json({
      id: result.id,
      ...result.properties
    });
  } catch (err) {
    console.error("❌ Failed to fetch meeting by ID:", err.message);
    res.status(404).send("Meeting not found");
  }
});

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
