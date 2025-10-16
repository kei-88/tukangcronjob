require('dotenv').config();
const express = require('express');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const path = require('path');
const cron = require('node-cron');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 3000;

// ======================
// View & Middleware
// ======================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));

// Serve static files (videos, images, etc.)
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  name: 'sid',
  secret: process.env.SESSION_SECRET || 'secret_dev',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, maxAge: 1000 * 60 * 60 },
}));

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 6,
  message: 'Terlalu sering login bro, tunggu bentar.',
});

function requireAuth(req, res, next) {
  if (req.session && req.session.user) return next();
  return res.redirect('/login');
}

// ======================
// Data Cron (In-memory)
// ======================
let cronJobs = [];
let cronStats = {
  totalExecutions: 0,
  successCount: 0,
  errorCount: 0
};

// ======================
// Routes
// ======================
app.get('/', (req, res) => {
  if (req.session.user) return res.redirect('/dashboard');
  res.redirect('/login');
});

app.get('/login', (req, res) => res.render('login', { error: null }));

app.post('/login', loginLimiter, (req, res) => {
  const { username, password } = req.body;
  
  // Parse multiple users from environment
  const usersString = process.env.USERS || `${process.env.ADMIN_USER}:${process.env.ADMIN_PASS}`;
  const users = usersString.split(',').reduce((acc, userPass) => {
    const [user, pass] = userPass.split(':');
    if (user && pass) {
      acc[user] = pass;
    }
    return acc;
  }, {});
  
  // Check credentials
  if (users[username] && users[username] === password) {
    req.session.user = { username };
    return res.redirect('/dashboard');
  }
  
  return res.status(401).render('login', { error: 'Username atau password salah bro.' });
});

app.get('/dashboard', requireAuth, (req, res) => {
  const successRate = cronStats.totalExecutions > 0 
    ? Math.round((cronStats.successCount / cronStats.totalExecutions) * 100) 
    : 100;
    
  res.render('dashboard', { 
    user: req.session.user, 
    cronJobs,
    stats: {
      ...cronStats,
      successRate
    }
  });
});

app.post('/add-cron', requireAuth, (req, res) => {
  const { url, interval } = req.body;
  if (!url) return res.redirect('/dashboard');

  const safeInterval = interval || '*/30 * * * * *'; // default tiap 30 detik

  const job = cron.schedule(safeInterval, async () => {
    cronStats.totalExecutions++;
    try {
      const res = await fetch(url, { timeout: 8000 });
      if (res.ok) {
        cronStats.successCount++;
        console.log(`[${new Date().toLocaleTimeString()}] ${url} → ${res.status} ✓`);
      } else {
        cronStats.errorCount++;
        console.log(`[${new Date().toLocaleTimeString()}] ${url} → ${res.status} ✗`);
      }
    } catch (err) {
      cronStats.errorCount++;
      console.log(`[${new Date().toLocaleTimeString()}] ${url} ERROR: ${err.message} ✗`);
    }
  });

  cronJobs.push({ url, interval: safeInterval, job });
  res.redirect('/dashboard');
});

app.post('/stop-cron', requireAuth, (req, res) => {
  const { url } = req.body;
  const index = cronJobs.findIndex(c => c.url === url);
  if (index >= 0) {
    cronJobs[index].job.stop();
    cronJobs.splice(index, 1);
  }
  res.redirect('/dashboard');
});

app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('sid');
    res.redirect('/login');
  });
});

app.listen(PORT, () => console.log(`✅ Cron server jalan di http://localhost:${PORT}`));
