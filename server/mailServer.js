const http = require('http');
const nodemailer = require('nodemailer');

const PORT = process.env.MAIL_SERVER_PORT || 4001;

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'tonystarm2003@gmail.com',
    pass: 'bdsynwfclowqcevu',
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
          from: '"CivicLens 2.0" <tonystarm2003@gmail.com>',
          to,
          subject,
          html,
          text: text || subject,
        });

        console.log(`[CivicLens Mailer] Successfully sent "${subject}" to ${to} (MessageId: ${info.messageId})`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, messageId: info.messageId }));
      } catch (err) {
        console.error('[CivicLens Mailer] Dispatch error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not Found' }));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[CivicLens Mailer] Live SMTP Relay running on http://0.0.0.0:${PORT}`);
});
