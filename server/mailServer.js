const http = require('http');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

// Load environment variables from .env securely
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...rest] = trimmed.split('=');
      const val = rest.join('=').replace(/(^"|"$|^'|'$)/g, '').trim();
      if (!process.env[key.trim()]) {
        process.env[key.trim()] = val;
      }
    }
  });
}

const PORT = process.env.MAIL_SERVER_PORT || 4001;
const SMTP_USER = process.env.EXPO_PUBLIC_SMTP_USER || process.env.SMTP_USER || '';
const SMTP_PASS = process.env.EXPO_PUBLIC_SMTP_PASS || process.env.SMTP_PASS || '';
const SMTP_HOST = process.env.EXPO_PUBLIC_SMTP_HOST || process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.EXPO_PUBLIC_SMTP_PORT || process.env.SMTP_PORT || '587', 10);
const MAIL_FROM = process.env.EXPO_PUBLIC_MAIL_FROM || `CivicLens 2.0 <${SMTP_USER}>`;

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: false,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

const server = http.createServer(async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'CivicLens Mailer' }));
    return;
  }

  if (req.url === '/api/mail/send' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', async () => {
      try {
        const { to, subject, html, text } = JSON.parse(body);

        if (!to || !subject) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Missing required fields (to, subject)' }));
          return;
        }

        const info = await transporter.sendMail({
          from: MAIL_FROM,
          to,
          subject,
          html,
          text: text || subject,
        });

        console.log(`[CivicLens Mailer] Successfully sent "${subject}" to ${to} (MessageId: ${info.messageId})`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, messageId: info.messageId }));
      } catch (err) {
        console.error('[CivicLens Mailer] Error sending email:', err.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`[CivicLens Mailer] Live relay server running on http://localhost:${PORT}`);
});
