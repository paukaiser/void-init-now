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
  origin: ['http://localhost:3000', 'http://localhost:8080'],
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
  console.log("📩 Incoming body:", req.body);

  try {
    const response = await axios.post('https://api.hubapi.com/crm/v3/objects/meetings/search', {
      filterGroups: [{
        filters: [
          { propertyName: "hubspot_owner_id", operator: "EQ", value: ownerId },
          { propertyName: "hs_meeting_start_time", operator: "GTE", value: startTime },
          { propertyName: "hs_meeting_start_time", operator: "LTE", value: endTime }
        ]
      }],
      properties: [
        "hs_object_id",
        "hs_timestamp",
        "hs_meeting_title",
        "hubspot_owner_id",
        "hs_internal_meeting_notes",
        "hs_meeting_location",
        "hs_meeting_start_time",
        "hs_meeting_end_time",
        "hs_meeting_outcome",
        "hs_activity_type"
      ],
      limit: 100
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    // 🧠 Add company association fetching per meeting
    const meetingsWithDetails = await Promise.all(
      response.data.results.map(async (meeting) => {
        const { id, properties } = meeting;

        let companyName = 'Unknown Company';
        

        try {
          const assocRes = await axios.get(
            `https://api.hubapi.com/crm/v3/objects/meetings/${id}/associations/companies`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          const companyId = assocRes.data.results?.[0]?.id;

          if (companyId) {
            const companyRes = await axios.get(
              `https://api.hubapi.com/crm/v3/objects/companies/${companyId}?properties=name`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            companyName = companyRes.data.properties.name || 'Unnamed Company';
          }
        } catch (e) {
          console.warn(`⚠️ Could not fetch company for meeting ${id}`);
        }
        const date = new Date(properties.hs_meeting_start_time).toLocaleDateString('de-DE');


        return {
          id,
          title: properties.hs_meeting_title || 'Untitled',
          startTime: properties.hs_meeting_start_time,
          endTime: properties.hs_meeting_end_time,
          date,
          address: properties.hs_meeting_location || 'No location',
          status: properties.hs_meeting_outcome || 'scheduled',
          type: properties.hs_activity_type || 'meeting',
          companyName
        };
      
      })
    );

    res.json({ results: meetingsWithDetails });
  } catch (err) {
    console.error("❌ HubSpot API error:", err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch meetings' });
  }
});

// ✅ Get one meeting by ID
app.get('/api/meeting/:id', async (req, res) => {
  console.log("Raw Start Time:", rawStartTime);
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


//Company Search
app.get('/api/companies/search', async (req, res) => {
  const token = req.session.accessToken;
  const query = req.query.q;

  if (!token) return res.status(401).send('Not authenticated');
  if (!query) return res.status(400).send('Missing query');

  const hubspotClient = new Client({ accessToken: token });

  try {
    const result = await hubspotClient.crm.companies.searchApi.doSearch({
      filterGroups: [{
        filters: [{
          propertyName: 'name',
          operator: 'CONTAINS_TOKEN',
          value: query
        }]
      }],
      properties: ['name', 'address', 'city', 'state', 'zip'],
      limit: 10
    });

    const companies = result.results.map(c => ({
      id: c.id,
      name: c.properties.name || 'Unnamed Company',
      address: `${c.properties.address || ''} ${c.properties.city || ''} ${c.properties.state || ''} ${c.properties.zip || ''}`.trim()
    }));

    res.json({ results: companies });
  } catch (err) {
    console.error("❌ Failed to search companies:", err.message);
    res.status(500).send("Search failed");
  }
});


// Add Meeting
app.post('/api/meetings/create', async (req, res) => {
  const token = req.session.accessToken;
  if (!token) return res.status(401).send('Not authenticated');

  const hubspotClient = new Client({ accessToken: token });

  const {
    title,
    companyId,
    contactId, // optional
    meetingType,
    startTime, // ISO format
    endTime,   // ISO format
    notes
  } = req.body;

  // Log everything you’re about to send!
  console.log("Creating meeting:", {
    title, companyId, contactId, meetingType, startTime, endTime, notes
  });

  // REQUIRED: hs_timestamp must be set and should match start time!
  const associations = [];
  if (companyId) {
    associations.push({
      to: { id: companyId },
      types: [
        {
          associationCategory: "HUBSPOT_DEFINED",
          associationTypeId: 200 // 200 is default for Meeting->Company
        }
      ]
    });
  }
  if (contactId) {
    associations.push({
      to: { id: contactId },
      types: [
        {
          associationCategory: "HUBSPOT_DEFINED",
          associationTypeId: 200 // 200 is default for Meeting->Contact
        }
      ]
    });
  }

  try {
    const meetingRes = await hubspotClient.crm.objects.meetings.basicApi.create({
      properties: {
        hs_meeting_title: title,
        hs_meeting_start_time: startTime,
        hs_meeting_end_time: endTime,
        hs_timestamp: startTime,
        hs_internal_meeting_notes: notes || '',
        hs_activity_type: meetingType,
        hs_meeting_outcome: 'SCHEDULED',
      },
      associations
    });

    console.log("Meeting created successfully:", meetingRes);
    res.json({ success: true, meetingId: meetingRes.id });
  } catch (err) {
    console.error("❌ Failed to create meeting:", err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to create meeting', details: err.response?.data || err.message });
  }
});




// Cancel a meeting (set outcome to CANCELED)
app.post('/api/meeting/:id/cancel', async (req, res) => {
  const token = req.session.accessToken;
  if (!token) return res.status(401).send('Not authenticated');

  const hubspotClient = new Client({ accessToken: token });
  const meetingId = req.params.id;

  try {
    await hubspotClient.crm.objects.meetings.basicApi.update(meetingId, {
      properties: {
        hs_meeting_outcome: "CANCELED"
      }
    });

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Failed to cancel meeting:", err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to cancel meeting' });
  }
});


// Fetch all tasks for the logged-in user (salesperson)
app.get('/api/tasks', async (req, res) => {
  const token = req.session.accessToken;
  if (!token) return res.status(401).send('Not authenticated');

  const hubspotClient = new Client({ accessToken: token });

  try {
    const response = await hubspotClient.crm.objects.tasks.basicApi.getPage(
      100, // limit (adjust as needed)
      undefined, // after (for pagination, leave undefined for first page)
      [
        "hs_task_body",
        "hs_timestamp",
        "hs_task_status",
        "hubspot_owner_id",
        "hs_task_priority",
        "hs_task_subject",
        "hs_task_due_date"
      ]
    );

    // Optionally, map/format the response as you wish
    const tasks = response.results.map(task => ({
      id: task.id,
      subject: task.properties.hs_task_subject,
      status: task.properties.hs_task_status,
      body: task.properties.hs_task_body,
      dueDate: task.properties.hs_task_due_date,
      ownerId: task.properties.hubspot_owner_id,
      createdAt: task.properties.hs_timestamp,
      // Add more fields or associations as needed
    }));

    res.json({ tasks });
  } catch (err) {
    console.error("❌ Failed to fetch tasks:", err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Reschedule a meeting
app.patch('/api/meetings/:id/reschedule', async (req, res) => {
  const token = req.session.accessToken;
  if (!token) return res.status(401).send('Not authenticated');

  const hubspotClient = new Client({ accessToken: token });
  const meetingId = req.params.id;
  const { startTime, endTime, notes } = req.body;
  console.log("About to PATCH with properties:", {
    hs_meeting_start_time: startTime,
    hs_meeting_end_time: endTime,
    // etc.
  });
  
  try {
    // Send timestamps as strings
    const result = await hubspotClient.crm.objects.meetings.basicApi.update(meetingId, {
      properties: {
        hs_meeting_start_time: startTime,
        hs_meeting_end_time: endTime,
        hs_timestamp: startTime,
        hs_meeting_outcome: "RESCHEDULED",
        hs_internal_meeting_notes: notes || '',
      }
    });
    // Log the FULL response from HubSpot!
    console.log('HubSpot PATCH response:', JSON.stringify(result, null, 2));
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Failed to reschedule meeting:", err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to reschedule meeting' });
  }
});
