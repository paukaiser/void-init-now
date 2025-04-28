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
import multer from 'multer';
import fetch from 'node-fetch';
import FormData from 'form-data';




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
// ✅ Get meetings by user WITH DEAL ID
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

    const meetingsWithDetails = await Promise.all(
      response.data.results.map(async (meeting) => {
        const { id, properties } = meeting;

        let companyName = 'Unknown Company';
        let dealId = null;

        // Fetch company name
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

        // Fetch associated dealId
        try {
          const dealsRes = await axios.get(
            `https://api.hubapi.com/crm/v4/objects/meetings/${id}/associations/deals`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          dealId = dealsRes.data.results?.[0]?.toObjectId || null;
        } catch (e) {
          console.warn(`⚠️ Could not fetch deal for meeting ${id}`);
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
          companyName,
          dealId // <--- THIS IS NEW!
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
      "hs_activity_type",
      "dealId"
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

// Send Voice Note to Zapier
const upload = multer(); // memory storage

app.post('/api/meeting/send-voice', upload.single('audio'), async (req, res) => {
  console.log('req.file:', req.file); // Log the file details
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file received' });
    }

    // Use form-data (Node, not web) for file upload
    const formData = new FormData();
    formData.append('audio', req.file.buffer, {
      filename: req.file.originalname || 'voice-note.webm',
      contentType: req.file.mimetype,
      knownLength: req.file.size,
    });

    const zapierResponse = await fetch('https://hooks.zapier.com/hooks/catch/20863141/2pdsjyw/', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders(),
    });

    if (!zapierResponse.ok) {
      const txt = await zapierResponse.text();
      console.error('Zapier responded with', zapierResponse.status, txt);
      return res.status(500).json({ error: 'Zapier webhook failed', zapierStatus: zapierResponse.status, zapierBody: txt });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Failed to forward audio to Zapier:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

const upload_contract = multer(); // In-memory storage



// Upload Contract
app.post('/api/meeting/:meetingId/upload-contract', upload_contract.single('contract'), async (req, res) => {
  const token = req.session.accessToken;
  if (!token) return res.status(401).send('Not authenticated');

  const { meetingId } = req.params;
  if (!req.file) return res.status(400).json({ error: 'No contract uploaded' });

  let dealId = req.body.dealId; // Try from frontend first
  console.log("dealId:", dealId);
  if (!dealId) {
    try {
      const dealsRes = await axios.get(
        `https://api.hubapi.com/crm/v4/objects/meetings/${meetingId}/associations/deals`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      dealId = dealsRes.data.results?.[0]?.toObjectId;
      if (!dealId) {
        return res.status(400).json({ error: 'No associated deal found for this meeting.' });
      }
    } catch (e) {
      return res.status(500).json({ error: 'Failed to find deal associated with this meeting.' });
    }
  }

  try {
    // Prepare form-data
    const fileFormData = new FormData();
    fileFormData.append('file', req.file.buffer, {
      filename: req.file.originalname || 'contract.pdf',
      contentType: req.file.mimetype,
    });
    fileFormData.append('options', JSON.stringify({
      access: "PRIVATE",
      name: req.file.originalname || "Contract",
    }));
    fileFormData.append('folderId', "189440789850");

    // Upload file to HubSpot
    const fileRes = await axios.post(
      'https://api.hubapi.com/files/v3/files',
      fileFormData,
      {
        headers: {
          ...fileFormData.getHeaders(),
          'Authorization': `Bearer ${token}`,
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      }
    );
    const fileId = fileRes.data.id;

    // Create a note and associate with the deal
    const noteRes = await axios.post(
      'https://api.hubapi.com/crm/v3/objects/notes',
      {
        properties: {
          hs_note_body: 'Signed contract uploaded.',
          hs_attachment_ids: fileId,
          hs_timestamp: Date.now()
        },
        associations: [
          {
            to: { id: dealId },
            types: [
              {
                associationCategory: "HUBSPOT_DEFINED",
                associationTypeId: 214
              }
            ]
          }
        ]
      },
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );

    res.json({ success: true, noteId: noteRes.data.id, fileId });
  } catch (err) {
    console.error("❌ Failed to upload contract and create note:", err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to upload contract', details: err.response?.data || err.message });
  }
});




// Closed Lost Reason Form
app.patch('/api/deal/:dealId/close-lost', async (req, res) => {
  const token = req.session.accessToken;
  if (!token) return res.status(401).send('Not authenticated');
  const { dealId } = req.params;
  const { deal_stage, closed_lost_reason } = req.body;
  const hubspotClient = new Client({ accessToken: token });

  try {
    await hubspotClient.crm.deals.basicApi.update(dealId, {
      properties: {
        dealstage: deal_stage, // Use 'dealstage' (HubSpot internal property)
        closed_lost_reason,    // Make sure this property exists in your HubSpot portal!
      },
    });
    res.json({ success: true });
  } catch (err) {
    // Add more detailed error logging:
    console.error("❌ Failed to update deal:", err.response?.data || err.message, err.stack);
    res.status(500).json({ error: 'Failed to update deal', details: err.response?.data || err.message });
  }
});

// Closed Won Reason Form
// PATCH /api/deal/:dealId/close-won

app.patch('/api/deal/:dealId/close-won', async (req, res) => {
  const token = req.session.accessToken;
  if (!token) return res.status(401).send('Not authenticated');
  
  const { dealId } = req.params;
  const { deal_stage, closed_won_reason, pos_competitor, payment_competitor } = req.body;

  // Required fields
  if (!deal_stage || !closed_won_reason) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Build properties object for HubSpot
    const properties = {
      dealstage: "closedwon", // Use HubSpot internal name (often "closedwon")
      closed_won_reason: closed_won_reason,
    };
    // Optional competitor fields if present
    if (pos_competitor) properties.pos_competitor = pos_competitor;
    if (payment_competitor) properties.payment_competitor = payment_competitor;

    // HubSpot PATCH update
    const updateRes = await axios.patch(
      `https://api.hubapi.com/crm/v3/objects/deals/${dealId}`,
      { properties },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    res.json({ success: true, updated: updateRes.data });
  } catch (err) {
    console.error("Failed to update deal as closed won:", err.response?.data || err.message);
    res.status(500).json({
      error: 'Failed to update deal',
      details: err.response?.data || err.message,
    });
  }
});
