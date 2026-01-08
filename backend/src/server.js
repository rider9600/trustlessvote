const express = require('express');
const session = require('express-session');
const cors = require('cors');
const multer = require('multer');
const { ConfidentialClientApplication } = require('@azure/msal-node');
const crypto = require('crypto');

const app = express();

// ---------- Config ----------
const PORT = process.env.PORT || 4000;
const SESSION_SECRET = process.env.SESSION_SECRET || 'devsecret';
const CORS_ORIGINS = (process.env.CORS_ORIGINS || 'http://localhost:3000').split(',');

// Azure/MSAL
const AZURE_CLIENT_ID = process.env.AZURE_CLIENT_ID || process.env.MICROSOFT_CLIENT_ID || '';
const AZURE_CLIENT_SECRET = process.env.AZURE_CLIENT_SECRET || process.env.MICROSOFT_CLIENT_SECRET || '';
const AZURE_TENANT_ID = process.env.AZURE_TENANT_ID || process.env.MICROSOFT_TENANT_ID || 'common';
const AUTHORITY = `https://login.microsoftonline.com/${AZURE_TENANT_ID}`;
const AUTH_REDIRECT_PATH = process.env.AUTH_REDIRECT_PATH || '/auth/redirect';
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
const REDIRECT_URI = process.env.AUTH_REDIRECT_URI || (BASE_URL + AUTH_REDIRECT_PATH);
const MS_SCOPES = (process.env.AZURE_SCOPE || 'User.Read Mail.Send offline_access openid profile email').split(' ');
const MAIL_SENDER_USER_ID = process.env.MAIL_SENDER_USER_ID || process.env.MAIL_SENDER_UPN || '';

// Supabase
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const SUPABASE_BUCKET = process.env.SUPABASE_FILES_BUCKET || 'uploads';
const SUPABASE_FILES_TABLE = process.env.SUPABASE_FILES_TABLE || 'files';
const SUPABASE_REMINDERS_TABLE = process.env.SUPABASE_REMINDERS_TABLE || 'email_reminders';

let supabaseClient = null;
async function getSupabase() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return null;
  if (!supabaseClient) {
    const mod = await import('@supabase/supabase-js');
    supabaseClient = mod.createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  }
  return supabaseClient;
}

// ---------- Middleware ----------
app.use(cors({ origin: CORS_ORIGINS, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // set true behind HTTPS proxy with trust proxy
    httpOnly: true,
    sameSite: 'lax'
  }
}));

// File upload handler (memory buffer; we stream to Supabase Storage)
const upload = multer({ storage: multer.memoryStorage() });

// MSAL app
const msalApp = new ConfidentialClientApplication({
  auth: {
    clientId: AZURE_CLIENT_ID,
    clientSecret: AZURE_CLIENT_SECRET,
    authority: AUTHORITY,
  },
});

// ---------- Helpers ----------
function ensureAuth(req, res, next) {
  const token = req.session?.accessToken;
  if (!token) return res.status(401).json({ error: 'Unauthorized. Please login.' });
  next();
}

async function graphRequest(token, path, options = {}) {
  const url = `https://graph.microsoft.com/v1.0${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Graph error ${res.status}: ${text}`);
  }
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return res.json();
  return res.text();
}

async function sendGraphMail(token, to, subject, bodyHtml) {
  const payload = {
    message: {
      subject,
      body: { contentType: 'HTML', content: bodyHtml },
      toRecipients: [{ emailAddress: { address: to } }],
    },
    saveToSentItems: true,
  };
  await graphRequest(token, '/me/sendMail', { method: 'POST', body: JSON.stringify(payload) });
}

async function sendGraphMailAsApp(to, subject, bodyHtml) {
  if (!MAIL_SENDER_USER_ID) throw new Error('MAIL_SENDER_USER_ID not configured');
  const tokenResponse = await msalApp.acquireTokenByClientCredential({ scopes: ['https://graph.microsoft.com/.default'] });
  const appToken = tokenResponse.accessToken;
  const payload = {
    message: {
      subject,
      body: { contentType: 'HTML', content: bodyHtml },
      toRecipients: [{ emailAddress: { address: to } }],
    },
    saveToSentItems: true,
  };
  await graphRequest(appToken, `/users/${encodeURIComponent(MAIL_SENDER_USER_ID)}/sendMail`, { method: 'POST', body: JSON.stringify(payload) });
}

// ---------- Routes ----------
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Auth
app.get('/auth/login', async (req, res) => {
  try {
    const authCodeUrlParameters = {
      scopes: MS_SCOPES,
      redirectUri: REDIRECT_URI,
      prompt: 'select_account',
    };
    const authUrl = await msalApp.getAuthCodeUrl(authCodeUrlParameters);
    res.redirect(authUrl);
  } catch (e) {
    res.status(500).json({ error: 'Login init failed', detail: e.message });
  }
});

app.get(AUTH_REDIRECT_PATH, async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).json({ error: 'Missing code' });
  try {
    const tokenResponse = await msalApp.acquireTokenByCode({
      code,
      scopes: MS_SCOPES,
      redirectUri: REDIRECT_URI,
    });
    req.session.accessToken = tokenResponse.accessToken;
    req.session.idTokenClaims = tokenResponse.idTokenClaims || {};
    res.redirect('/auth/me');
  } catch (e) {
    res.status(400).json({ error: 'Auth failed', detail: e.message });
  }
});

app.get('/auth/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

app.get('/auth/me', ensureAuth, async (req, res) => {
  try {
    const me = await graphRequest(req.session.accessToken, '/me');
    res.json(me);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Email
app.post('/email/send', ensureAuth, async (req, res) => {
  const { to, subject = '(no subject)', body = '', send_at } = req.body || {};
  if (!to) return res.status(400).json({ error: "Missing 'to'" });
  try {
    const supabase = await getSupabase();
    if (send_at && supabase) {
      // store reminder for later processing by a cron/worker
      const { error } = await supabase.from(SUPABASE_REMINDERS_TABLE).insert({
        to_address: to,
        subject,
        body_html: body,
        run_at: send_at,
        created_at: new Date().toISOString(),
      });
      if (error) return res.status(500).json({ error: 'Failed to schedule', detail: error.message });
      return res.json({ scheduled: true, run_at: send_at });
    } else {
      await sendGraphMail(req.session.accessToken, to, subject, body);
      return res.json({ sent: true });
    }
  } catch (e) {
    res.status(500).json({ error: 'Send failed', detail: e.message });
  }
});

// Cron endpoint to process due reminders (hook with Render Cron)
app.post('/email/process-reminders', async (req, res) => {
  const supabase = await getSupabase();
  if (!supabase) return res.json({ processed: 0, note: 'supabase not configured' });
  try {
    const nowIso = new Date().toISOString();
    const { data: due, error } = await supabase
      .from(SUPABASE_REMINDERS_TABLE)
      .select('*')
      .lte('run_at', nowIso)
      .is('sent_at', null)
      .limit(50);
    if (error) return res.status(500).json({ error: error.message });

    let count = 0;
    for (const r of due || []) {
      try {
        await sendGraphMailAsApp(r.to_address, r.subject, r.body_html);
        await supabase
          .from(SUPABASE_REMINDERS_TABLE)
          .update({ sent_at: new Date().toISOString() })
          .eq('id', r.id);
        count++;
      } catch (e) {
        // optionally record error
      }
    }
    res.json({ processed: count });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Files
app.post('/files', ensureAuth, upload.single('file'), async (req, res) => {
  const supabase = await getSupabase();
  if (!supabase) return res.status(500).json({ error: 'Supabase not configured' });
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'No file' });
  const ext = (file.originalname.split('.').pop() || '').toLowerCase();
  const id = cryptoRandomId();
  const path = `${id}-${sanitizeName(file.originalname)}`;
  try {
    const { error: upErr } = await supabase.storage.from(SUPABASE_BUCKET).upload(path, file.buffer, {
      contentType: file.mimetype || 'application/octet-stream',
      upsert: false,
    });
    if (upErr) return res.status(500).json({ error: 'Upload failed', detail: upErr.message });

    // optional metadata table
    await supabase
      .from(SUPABASE_FILES_TABLE)
      .insert({
        id,
        original_name: file.originalname,
        mime_type: file.mimetype,
        size: file.size,
        path,
        uploader: currentUser(req),
        created_at: new Date().toISOString(),
      });

    res.json({ id, name: file.originalname, path });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/files', ensureAuth, async (req, res) => {
  const supabase = await getSupabase();
  if (!supabase) return res.status(500).json({ error: 'Supabase not configured' });
  try {
    // Prefer table if exists
    let items = [];
    const { data, error } = await supabase
      .from(SUPABASE_FILES_TABLE)
      .select('id, original_name, mime_type, size, uploader, created_at, path')
      .order('created_at', { ascending: false })
      .limit(100);
    if (!error && data) {
      items = data;
    } else {
      // fallback to storage listing (no uploader)
      const { data: list, error: listErr } = await supabase.storage.from(SUPABASE_BUCKET).list('', { limit: 100 });
      if (listErr) return res.status(500).json({ error: listErr.message });
      items = (list || []).map((o) => ({ id: o.name.split('-')[0], original_name: o.name, size: o.metadata?.size, path: o.name, created_at: o.created_at }));
    }
    res.json({ files: items });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/files/:id', ensureAuth, async (req, res) => {
  const supabase = await getSupabase();
  if (!supabase) return res.status(500).json({ error: 'Supabase not configured' });
  try {
    const id = req.params.id;
    let path = null;
    const { data, error } = await supabase
      .from(SUPABASE_FILES_TABLE)
      .select('path, original_name')
      .eq('id', id)
      .maybeSingle();
    let downloadName = 'download';
    if (!error && data) {
      path = data.path; downloadName = data.original_name || downloadName;
    } else {
      // try storage lookup with prefix
      const { data: list } = await supabase.storage.from(SUPABASE_BUCKET).list('', { search: id });
      const hit = (list || []).find((o) => o.name.startsWith(id));
      if (hit) path = hit.name;
    }
    if (!path) return res.status(404).json({ error: 'Not found' });

    const { data: fileData, error: dlErr } = await supabase.storage.from(SUPABASE_BUCKET).download(path);
    if (dlErr) return res.status(500).json({ error: dlErr.message });

    res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"`);
    res.send(Buffer.from(await fileData.arrayBuffer()));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/files/:id', ensureAuth, async (req, res) => {
  const supabase = await getSupabase();
  if (!supabase) return res.status(500).json({ error: 'Supabase not configured' });
  try {
    const id = req.params.id;
    let path = null;
    const { data, error } = await supabase
      .from(SUPABASE_FILES_TABLE)
      .select('path')
      .eq('id', id)
      .maybeSingle();
    if (!error && data) {
      path = data.path;
    } else {
      const { data: list } = await supabase.storage.from(SUPABASE_BUCKET).list('', { search: id });
      const hit = (list || []).find((o) => o.name.startsWith(id));
      if (hit) path = hit.name;
    }
    if (!path) return res.status(404).json({ error: 'Not found' });

    const { error: rmErr } = await supabase.storage.from(SUPABASE_BUCKET).remove([path]);
    if (rmErr) return res.status(500).json({ error: rmErr.message });

    await supabase.from(SUPABASE_FILES_TABLE).delete().eq('id', id);
    res.json({ deleted: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---------- Utils ----------
function cryptoRandomId() {
  return crypto.randomBytes(12).toString('hex');
}
function sanitizeName(name) {
  return (name || '').replace(/[^a-zA-Z0-9_.-]/g, '_');
}
function currentUser(req) {
  const claims = req.session?.idTokenClaims || {};
  return claims.preferred_username || claims.upn || claims.oid || 'anonymous';
}

// ---------- Start ----------
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend listening on :${PORT}`);
});
