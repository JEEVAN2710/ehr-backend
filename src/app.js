import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/authRoutes.js';
import recordRoutes, { publicRouter as publicRecordRoutes } from './routes/recordRoutes.js';
import accessRequestRoutes from './routes/accessRequestRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import testRoutes from './routes/testRoutes.js';
import { sendMail } from './services/mailService.js';

const app = express();

// Trust proxy - required for Render and other reverse proxies
// This allows rate limiters to correctly identify client IPs
app.set('trust proxy', 1);

app.use(helmet());

// Configure CORS to handle multiple origins
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['*'];

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}));

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later',
});

app.use('/api/', generalLimiter);

// Public routes (no authentication)
app.use('/api/records', publicRecordRoutes);

app.use('/api/auth', authRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/access-requests', accessRequestRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api', testRoutes); // Test routes

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/version', (req, res) => {
  res.status(200).json({
    success: true,
    version: '1.0.1',
    commit: 'fa80a2c',
    features: ['my-records-route', 'share-all-fix'],
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/mail/test', async (req, res) => {
  const to = req.query.to || process.env.SMTP_USER;
  const name = req.query.name || 'User';
  const email = req.query.email || to;
  try {
    const info = await sendMail({
      to,
      subject: 'Welcome to EHR',
      text: `Welcome ${name}. Your registered email is ${email}.`,
      html: `
        <div style="font-family:system-ui,Segoe UI,Arial;max-width:520px;margin:0 auto;padding:16px;border:1px solid #eee;border-radius:8px">
          <h2 style="margin:0 0 12px;color:#1f2937">Welcome to EHR</h2>
          <p style="margin:0 0 8px;color:#374151">Hi <strong>${name}</strong>,</p>
          <p style="margin:0 0 8px;color:#374151">Your account is ready.</p>
          <div style="margin:12px 0;padding:12px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px">
            <div style="color:#374151">Registered email: <strong>${email}</strong></div>
          </div>
          <p style="margin:16px 0 0;color:#6b7280;font-size:12px">If you did not request this, please ignore this email.</p>
        </div>
      `,
    });
    res.json({ success: true, messageId: info.messageId });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to send email', error: error.message });
  }
});

app.get('/signup-test', (req, res) => {
  res.send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>EHR Signup Test</title>
    <style>
      body { font-family: system-ui, sans-serif; margin: 2rem; }
      form { max-width: 420px; display: grid; gap: 12px; }
      input, select, button { padding: 8px; font-size: 14px; }
      .row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
      .msg { margin-top: 16px; white-space: pre-wrap; }
    </style>
  </head>
  <body>
    <h1>Signup Test</h1>
    <p>Posts to <code>/api/auth/register</code> and shows the JSON response. If SMTP is configured, a welcome email is sent; otherwise it logs to server console.</p>
    <form id="signupForm">
      <div class="row">
        <input id="firstName" placeholder="First name" required />
        <input id="lastName" placeholder="Last name" required />
      </div>
      <input id="email" type="email" placeholder="Email" required />
      <input id="password" type="password" placeholder="Password (min 6)" required />
      <select id="role">
        <option value="patient">patient</option>
        <option value="doctor">doctor</option>
        <option value="labassistant">labassistant</option>
      </select>
      <button type="submit">Sign Up</button>
    </form>
    <div class="msg" id="msg"></div>

    <script>
      const form = document.getElementById('signupForm');
      const msg = document.getElementById('msg');
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        msg.textContent = 'Submitting...';
        const payload = {
          firstName: document.getElementById('firstName').value,
          lastName: document.getElementById('lastName').value,
          email: document.getElementById('email').value,
          password: document.getElementById('password').value,
          role: document.getElementById('role').value,
        };
        try {
          const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          const data = await res.json();
          msg.textContent = JSON.stringify(data, null, 2);
        } catch (err) {
          msg.textContent = 'Error: ' + err.message;
        }
      });
    </script>
  </body>
</html>`);
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

export default app;
