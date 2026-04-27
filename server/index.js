const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const cors = require('cors');
const pool = require('./db');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });


const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url} - ${res.statusCode} (${Date.now() - start}ms)`);
  });
  next();
});

// ==================== FILE UPLOADS ====================
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['.pdf', '.png', '.jpg', '.jpeg'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only PDF, PNG, and JPG files are allowed'));
  },
});

// Serve uploaded files statically
app.use('/uploads', express.static(UPLOADS_DIR));

// Upload endpoint
app.post('/api/staff/upload', (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    const url = `/uploads/${req.file.filename}`;
    res.json({ success: true, url, originalName: req.file.originalname, mimeType: req.file.mimetype });
  });
});

// ==================== WEBSOCKET STAFF CHAT ====================

// Map: ws -> { name, window } - tracks connected staff
const wsClients = new Map();

const WS_OPEN = 1;

const wsBroadcast = (data) => {
  const msg = JSON.stringify(data);
  for (const ws of wsClients.keys()) {
    if (ws.readyState === WS_OPEN) ws.send(msg);
  }
};

const wsSendTo = (targetName, data) => {
  const msg = JSON.stringify(data);
  for (const [ws, info] of wsClients.entries()) {
    if (info.name === targetName && ws.readyState === WS_OPEN) ws.send(msg);
  }
};

const broadcastUsers = () => {
  const users = [...wsClients.values()];
  wsBroadcast({ type: 'users', users });
};

const wss = new WebSocketServer({ server, path: '/ws/staff-chat' });

wss.on('connection', (ws) => {
  wsClients.set(ws, { name: null, window: null });

  ws.on('message', async (raw) => {
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }
    const identity = wsClients.get(ws);

    if (msg.type === 'identify') {
      wsClients.set(ws, { name: msg.name, window: msg.window || null });
      broadcastUsers();
      // Send board history (last 80 messages)
      try {
        const { rows } = await pool.query(
          'SELECT * FROM staff_messages ORDER BY created_at DESC LIMIT 80'
        );
        ws.send(JSON.stringify({ type: 'history_board', messages: rows.reverse() }));
      } catch {}
      // Send PM history for this user
      try {
        const { rows } = await pool.query(
          `SELECT * FROM staff_pm WHERE from_name = $1 OR to_name = $1 ORDER BY created_at ASC`,
          [msg.name]
        );
        ws.send(JSON.stringify({ type: 'history_pm', messages: rows }));
      } catch {}
      return;
    }

    if (!identity.name) return; // not identified yet

    if (msg.type === 'board') {
      try {
        const { rows } = await pool.query(
          `INSERT INTO staff_messages (sender_name, sender_window, message, attachment_url, attachment_name, attachment_mime)
           VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
          [identity.name, identity.window, msg.message || null,
           msg.attachmentUrl || null, msg.attachmentName || null, msg.attachmentMime || null]
        );
        wsBroadcast({ type: 'board', ...rows[0] });
      } catch {}
    }

    if (msg.type === 'pm') {
      try {
        const { rows } = await pool.query(
          `INSERT INTO staff_pm (from_name, from_window, to_name, message, attachment_url, attachment_name, attachment_mime)
           VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
          [identity.name, identity.window, msg.to, msg.message || null,
           msg.attachmentUrl || null, msg.attachmentName || null, msg.attachmentMime || null]
        );
        const payload = { type: 'pm', ...rows[0] };
        wsSendTo(msg.to, payload);
        ws.send(JSON.stringify(payload));
      } catch {}
    }

    if (msg.type === 'pm_read') {
      try {
        await pool.query(`UPDATE staff_pm SET is_read = true WHERE to_name = $1 AND from_name = $2`, [identity.name, msg.from]);
      } catch {}
    }
  });

  ws.on('close', () => {
    wsClients.delete(ws);
    broadcastUsers();
  });
});

// Init messaging tables
const initMessagingTables = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS staff_messages (
      id SERIAL PRIMARY KEY,
      sender_name TEXT NOT NULL,
      sender_window TEXT,
      message TEXT,
      attachment_url TEXT,
      attachment_name TEXT,
      attachment_mime TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  // Add attachment columns if table already exists (migration)
  await pool.query(`ALTER TABLE staff_messages ADD COLUMN IF NOT EXISTS attachment_url TEXT`);
  await pool.query(`ALTER TABLE staff_messages ADD COLUMN IF NOT EXISTS attachment_name TEXT`);
  await pool.query(`ALTER TABLE staff_messages ADD COLUMN IF NOT EXISTS attachment_mime TEXT`);
  await pool.query(`ALTER TABLE staff_messages ALTER COLUMN message DROP NOT NULL`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS staff_pm (
      id SERIAL PRIMARY KEY,
      from_name TEXT NOT NULL,
      from_window TEXT,
      to_name TEXT NOT NULL,
      message TEXT,
      attachment_url TEXT,
      attachment_name TEXT,
      attachment_mime TEXT,
      is_read BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  await pool.query(`ALTER TABLE staff_pm ADD COLUMN IF NOT EXISTS attachment_url TEXT`);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS corporate_accounts (
      id SERIAL PRIMARY KEY,
      account_number TEXT UNIQUE NOT NULL,
      company_name TEXT NOT NULL,
      contact_person TEXT,
      contact_email TEXT,
      contact_phone TEXT,
      credit_limit DECIMAL(12, 2) DEFAULT 0,
      balance DECIMAL(12, 2) DEFAULT 0,
      status TEXT DEFAULT 'active',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  await pool.query(`ALTER TABLE staff_pm ADD COLUMN IF NOT EXISTS attachment_name TEXT`);
  await pool.query(`ALTER TABLE staff_pm ADD COLUMN IF NOT EXISTS attachment_mime TEXT`);
  await pool.query(`ALTER TABLE staff_pm ALTER COLUMN message DROP NOT NULL`);
};

initMessagingTables().catch(err => console.error('Messaging table init error:', err));

// ==================== CLINIC SETTINGS CACHE ====================

let clinicSettings = {};

const loadSettings = async () => {
  try {
    const { rows } = await pool.query('SELECT key, value FROM clinic_settings');
    clinicSettings = {};
    rows.forEach(r => { clinicSettings[r.key] = r.value; });
  } catch (_) {}
};

const getSetting = (key, fallback = '') => clinicSettings[key] ?? fallback;

const applyTemplate = (template, vars) => {
  return (template || '')
    .replace(/{name}/g,        vars.name        || '')
    .replace(/{date}/g,        vars.date        || '')
    .replace(/{time}/g,        vars.time        || '')
    .replace(/{service}/g,     vars.service     || '')
    .replace(/{ref}/g,         String(vars.ref  || ''))
    .replace(/{cancel_url}/g,  vars.cancel_url  || '')
    .replace(/{clinic_name}/g, vars.clinic_name || '')
    .replace(/{address}/g,     vars.address     || '')
    .replace(/{phone}/g,       vars.phone       || '')
    .replace(/{old_date}/g,    vars.old_date    || '')
    .replace(/{old_time}/g,    vars.old_time    || '');
};

// Simple in-memory session store (for demo - use Redis in production)
const sessions = new Map();

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Base URL for the frontend (change this in production)
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Semaphore SMS API configuration
const SEMAPHORE_API_KEY = process.env.SEMAPHORE_API_KEY || '';
const SEMAPHORE_SENDER_NAME = process.env.SEMAPHORE_SENDER_NAME || 'CLINIC';

// Function to send SMS via Semaphore
const sendSMS = async (phoneNumber, message) => {
  if (!SEMAPHORE_API_KEY) {
    console.log('SMS not sent - SEMAPHORE_API_KEY not configured');
    return false;
  }

  try {
    // Format phone number for Philippines (remove leading 0, add 63)
    let formattedNumber = phoneNumber.replace(/[^0-9]/g, '');
    if (formattedNumber.startsWith('0')) {
      formattedNumber = '63' + formattedNumber.substring(1);
    } else if (!formattedNumber.startsWith('63')) {
      formattedNumber = '63' + formattedNumber;
    }

    const response = await fetch('https://api.semaphore.co/api/v4/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apikey: SEMAPHORE_API_KEY,
        number: formattedNumber,
        message: message,
        sendername: SEMAPHORE_SENDER_NAME
      })
    });

    const data = await response.json();
    console.log('SMS sent to:', formattedNumber, data);
    return true;
  } catch (error) {
    console.error('SMS error:', error);
    return false;
  }
};

// ==================== DEFAULT EMAIL TEMPLATES ====================

const DEFAULT_CONFIRMATION_HTML = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #1c1917; padding: 20px; text-align: center;">
          <h1 style="color: #E4FE7B; margin: 0;">{clinic_name}</h1>
        </div>
        <div style="padding: 30px; background: #f5f5f5;">
          <h2 style="color: #1c1917;">Appointment Confirmed!</h2>
          <p>Dear <strong>{name}</strong>,</p>
          <p>Your appointment has been successfully booked. Here are your details:</p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Service:</strong> {service}</p>
            <p><strong>Date:</strong> {date}</p>
            <p><strong>Time:</strong> {time}</p>
            <p><strong>Reference ID:</strong> #{ref}</p>
          </div>
          <p style="color: #666;">Please arrive 10 minutes before your scheduled time.</p>
          <div style="margin: 25px 0; text-align: center;">
            <a href="{cancel_url}" style="display: inline-block; padding: 12px 24px; background: #dc2626; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Cancel Appointment
            </a>
          </div>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="color: #888; font-size: 12px;">{clinic_name}<br>{address}<br>Phone: {phone}</p>
          </div>
        </div>
      </div>`;

const DEFAULT_CANCELLATION_HTML = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #1c1917; padding: 20px; text-align: center;">
          <h1 style="color: #E4FE7B; margin: 0;">{clinic_name}</h1>
        </div>
        <div style="padding: 30px; background: #f5f5f5;">
          <h2 style="color: #dc2626;">Appointment Cancelled</h2>
          <p>Dear <strong>{name}</strong>,</p>
          <p>Your appointment has been successfully cancelled. Here were the details:</p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; opacity: 0.7;">
            <p style="text-decoration: line-through;"><strong>Service:</strong> {service}</p>
            <p style="text-decoration: line-through;"><strong>Date:</strong> {date}</p>
            <p style="text-decoration: line-through;"><strong>Time:</strong> {time}</p>
            <p><strong>Reference ID:</strong> #{ref}</p>
          </div>
          <p style="color: #666;">If you need to book a new appointment, please visit our website or contact us.</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="color: #888; font-size: 12px;">{clinic_name}<br>{address}<br>Phone: {phone}</p>
          </div>
        </div>
      </div>`;

const DEFAULT_RESCHEDULE_HTML = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #1c1917; padding: 20px; text-align: center;">
          <h1 style="color: #E4FE7B; margin: 0;">{clinic_name}</h1>
        </div>
        <div style="padding: 30px; background: #f5f5f5;">
          <h2 style="color: #1c1917;">Appointment Rescheduled</h2>
          <p>Dear <strong>{name}</strong>,</p>
          <p>Your appointment has been rescheduled. Here are your new details:</p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Service:</strong> {service}</p>
            <p><strong>New Date:</strong> {date}</p>
            <p><strong>New Time:</strong> {time}</p>
            <p style="color: #888; text-decoration: line-through;">Previous: {old_date} at {old_time}</p>
            <p><strong>Reference ID:</strong> #{ref}</p>
          </div>
          <p style="color: #666;">Please arrive 10 minutes before your scheduled time.</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="color: #888; font-size: 12px;">{clinic_name}<br>{address}<br>Phone: {phone}</p>
          </div>
        </div>
      </div>`;

const DEFAULT_REMINDER_HTML = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #1c1917; padding: 20px; text-align: center;">
          <h1 style="color: #E4FE7B; margin: 0;">{clinic_name}</h1>
        </div>
        <div style="padding: 30px; background: #f5f5f5;">
          <h2 style="color: #1c1917;">Appointment Reminder</h2>
          <p>Dear <strong>{name}</strong>,</p>
          <p>This is a friendly reminder that you have an appointment <strong>tomorrow</strong>.</p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Service:</strong> {service}</p>
            <p><strong>Date:</strong> {date}</p>
            <p><strong>Time:</strong> {time}</p>
            <p><strong>Reference ID:</strong> #{ref}</p>
          </div>
          <p style="color: #666;">Please arrive 10 minutes before your scheduled time.</p>
          <p style="color: #666;">If you need to cancel or reschedule, please contact us as soon as possible.</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="color: #888; font-size: 12px;">{clinic_name}<br>{address}<br>Phone: {phone}</p>
          </div>
        </div>
      </div>`;

// ==================== EMAIL / SMS HELPERS ====================

const makeVars = (appointment, cancelUrl = '') => ({
  name:        appointment.full_name,
  date:        appointment.preferred_date,
  time:        appointment.preferred_time,
  service:     appointment.service_type,
  ref:         appointment.id,
  cancel_url:  cancelUrl,
  clinic_name: getSetting('clinic_name', 'HealthCare Clinic'),
  address:     getSetting('clinic_address', 'Cantecson, Gairan, Bogo City, Cebu'),
  phone:       getSetting('clinic_phone', '+63 912 345 6789'),
});

// Function to send confirmation email
const sendConfirmationEmail = async (appointment) => {
  const cancelUrl = `${FRONTEND_URL}?page=my-appointment&token=${appointment.cancel_token}`;
  const vars = makeVars(appointment, cancelUrl);
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: appointment.email,
      subject: applyTemplate(getSetting('email_confirmation_subject', 'Appointment Confirmation - {clinic_name}'), vars),
      html:    applyTemplate(getSetting('email_confirmation_body',    DEFAULT_CONFIRMATION_HTML), vars),
    });
    console.log('Confirmation email sent to:', appointment.email);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Create a new appointment
app.post('/api/appointments', async (req, res) => {
  try {
    const {
      fullName,
      phoneNumber,
      email,
      serviceType,
      preferredDate,
      preferredTime,
      notes,
      specialistId,
      agentCode,
      pickupLocation,
      destinationLocation,
      pickupLat,
      pickupLng,
      destLat,
      destLng,
      totalAmount
    } = req.body;

    // Validate required fields
    if (!fullName || !phoneNumber || !email || !serviceType || !preferredDate || !preferredTime) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields'
      });
    }

    // Check for overlapping appointments (same date and time)
    const overlapCheck = await pool.query(
      `SELECT * FROM appointments
       WHERE preferred_date = $1
       AND preferred_time = $2
       AND status != 'cancelled'`,
      [preferredDate, preferredTime]
    );

    if (overlapCheck.rows.length > 0 && agentCode !== 'DISPATCHER') {
      return res.status(409).json({
        success: false,
        message: `Sorry, the time slot ${preferredTime} on ${preferredDate} is already booked. Please choose a different time.`
      });
    }

    // Generate a unique cancel token
    const cancelToken = Math.random().toString(36).substring(2) + Date.now().toString(36) + Math.random().toString(36).substring(2);

    // Insert into database
    const query = `
      INSERT INTO appointments (
        full_name, phone_number, email, service_type, preferred_date, 
        preferred_time, notes, cancel_token, specialist_id, agent_code, 
        pickup_location, destination_location,
        pickup_lat, pickup_lng, dest_lat, dest_lng,
        total_amount
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *
    `;

    const values = [
      fullName, 
      phoneNumber, 
      email, 
      serviceType, 
      preferredDate, 
      preferredTime, 
      notes || '', 
      cancelToken, 
      specialistId === 'any' ? null : specialistId, 
      agentCode, 
      pickupLocation, 
      destinationLocation,
      pickupLat || null,
      pickupLng || null,
      destLat || null,
      destLng || null,
      totalAmount || 0
    ];
    const result = await pool.query(query, values);

    // Send confirmation email and SMS (don't wait for it, don't fail if it fails)
    const appointment = result.rows[0];
    sendConfirmationEmail(appointment).catch(err => console.error('Email error:', err));

    // Send SMS confirmation
    const smsTpl = getSetting('sms_confirmation', 'Hi {name}, your appointment at {clinic_name} is confirmed for {date} at {time}. Ref#{ref}');
    const smsMessage = applyTemplate(smsTpl, makeVars(appointment));
    sendSMS(appointment.phone_number, smsMessage).catch(err => console.error('SMS error:', err));

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully! A confirmation email has been sent.',
      appointment: appointment
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to book appointment. Please try again.'
    });
  }
});

// Get available time slots for a specific date
app.get('/api/available-slots', async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required'
      });
    }

    // Check if date is blocked (holiday/closed)
    const blockedCheck = await pool.query(
      'SELECT * FROM blocked_dates WHERE blocked_date = $1',
      [date]
    );

    if (blockedCheck.rows.length > 0) {
      return res.json({
        success: true,
        date,
        availableSlots: [],
        bookedSlots: [],
        blocked: true,
        blockReason: blockedCheck.rows[0].reason
      });
    }

    // All possible time slots (24 hours)
    const allSlots = [];
    for (let i = 0; i < 24; i++) {
        const h = i % 12 || 12;
        const ampm = i < 12 ? 'AM' : 'PM';
        allSlots.push(`${h}:00 ${ampm}`);
    }

    // Get booked slots for the date
    const bookedResult = await pool.query(
      `SELECT preferred_time FROM appointments
       WHERE preferred_date = $1
       AND status != 'cancelled'`,
      [date]
    );

    const bookedSlots = bookedResult.rows.map(row => row.preferred_time);
    const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));

    res.json({
      success: true,
      date,
      availableSlots,
      bookedSlots,
      blocked: false
    });
  } catch (error) {
    console.error('Error fetching available slots:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available slots'
    });
  }
});

// Get all appointments (for admin purposes)
app.get('/api/appointments', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM appointments ORDER BY created_at DESC'
    );
    res.json({
      success: true,
      appointments: result.rows
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments'
    });
  }
});

// Search appointments with filters (must be before /:id route)
app.get('/api/appointments/search', async (req, res) => {
  try {
    const { query, startDate, endDate, status } = req.query;

    let sql = 'SELECT * FROM appointments WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (query) {
      sql += ` AND (
        LOWER(full_name) LIKE LOWER($${paramIndex}) OR
        phone_number LIKE $${paramIndex} OR
        LOWER(email) LIKE LOWER($${paramIndex})
      )`;
      params.push(`%${query}%`);
      paramIndex++;
    }

    if (startDate) {
      sql += ` AND preferred_date >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      sql += ` AND preferred_date <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    if (status && status !== 'all') {
      sql += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    sql += ' ORDER BY preferred_date DESC, preferred_time DESC';

    const result = await pool.query(sql, params);

    res.json({
      success: true,
      appointments: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed'
    });
  }
});

// Get a single appointment by ID
app.get('/api/appointments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM appointments WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.json({
      success: true,
      appointment: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointment'
    });
  }
});

// Update appointment status
app.patch('/api/appointments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await pool.query(
      'UPDATE appointments SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.json({
      success: true,
      message: 'Appointment updated successfully',
      appointment: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update appointment'
    });
  }
});

// ==================== ADMIN AUTHENTICATION ====================

// Staff login
app.post('/api/staff/login', async (req, res) => {
  try {
    let { username='', password='' } = req.body; username = username.trim(); password = password.trim();
    const result = await pool.query('SELECT * FROM queue_staff WHERE username = $1 AND is_active = true', [username]);
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }
    const staff = result.rows[0];
    const isMatch = await bcrypt.compare(password, staff.password);
    if (isMatch) {
      res.json({ success: true, message: 'Login successful', staff: { id: staff.id, name: staff.name, username: staff.username } });
    } else {
      res.status(401).json({ success: false, message: 'Invalid username or password' });
    }
  } catch (error) {
    console.error('Staff login error:', error);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

app.get('/api/admin/staff', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, username, name, role, is_active, created_at FROM queue_staff ORDER BY name ASC');
    res.json({ success: true, staff: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed' });
  }
});

app.post('/api/admin/staff', async (req, res) => {
  try {
    const { username, password, name } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query('INSERT INTO queue_staff (username, password, name) VALUES ($1, $2, $3) RETURNING id, username, name, role', [username, hash, name]);
    res.json({ success: true, staff: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') return res.status(400).json({ success: false, message: 'Username already exists' });
    res.status(500).json({ success: false, message: 'Failed' });
  }
});

app.delete('/api/admin/staff/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM queue_staff WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed' });
  }
});

// Admin login
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username = '', password = '' } = req.body || {};
    
    // TEMPORARY EASY LOGIN FOR CONFIGURATION
    if ((username.toLowerCase() === 'admin' && password === 'admin') || 
        (username.toLowerCase() === 'admin' && password === 'clinic2024')) {
      
      const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
      sessions.set(token, { username: 'admin', loginTime: new Date() });

      return res.json({
        success: true,
        message: 'Login successful',
        token
      });
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Verify admin token
app.get('/api/admin/verify', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (token && sessions.has(token)) {
    res.json({ success: true, valid: true });
  } else {
    res.status(401).json({ success: false, valid: false });
  }
});

// Admin logout
app.post('/api/admin/logout', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (token) {
    sessions.delete(token);
  }

  res.json({ success: true, message: 'Logged out successfully' });
});

// ==================== PATIENT SELF-SERVICE ====================

// Look up appointment by email and reference ID
app.post('/api/patient/lookup', async (req, res) => {
  try {
    const { email, referenceId } = req.body;

    if (!email || !referenceId) {
      return res.status(400).json({
        success: false,
        message: 'Email and Reference ID are required'
      });
    }

    const result = await pool.query(
      `SELECT id, full_name, phone_number, email, service_type, preferred_date, preferred_time, notes, status, cancel_token, created_at
       FROM appointments
       WHERE LOWER(email) = LOWER($1) AND id = $2`,
      [email, referenceId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found. Please check your email and reference ID.'
      });
    }

    res.json({
      success: true,
      appointment: result.rows[0]
    });
  } catch (error) {
    console.error('Lookup error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to look up appointment'
    });
  }
});

// Get appointment by cancel token (for email link)
app.get('/api/patient/appointment/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const result = await pool.query(
      `SELECT id, full_name, phone_number, email, service_type, preferred_date, preferred_time, notes, status, cancel_token, created_at
       FROM appointments
       WHERE cancel_token = $1`,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found or link has expired'
      });
    }

    res.json({
      success: true,
      appointment: result.rows[0]
    });
  } catch (error) {
    console.error('Token lookup error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointment'
    });
  }
});

// Patient cancels their own appointment
app.post('/api/patient/cancel', async (req, res) => {
  try {
    const { cancelToken, reason } = req.body;

    if (!cancelToken) {
      return res.status(400).json({
        success: false,
        message: 'Invalid cancellation request'
      });
    }

    // Get the appointment
    const appointment = await pool.query(
      'SELECT * FROM appointments WHERE cancel_token = $1',
      [cancelToken]
    );

    if (appointment.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    const apt = appointment.rows[0];

    // Check if already cancelled
    if (apt.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This appointment has already been cancelled'
      });
    }

    // Check if appointment is in the past
    const appointmentDate = new Date(apt.preferred_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (appointmentDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel past appointments'
      });
    }

    // Cancel the appointment
    await pool.query(
      `UPDATE appointments
       SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP, cancellation_reason = $1
       WHERE cancel_token = $2`,
      [reason || 'Cancelled by patient', cancelToken]
    );

    // Send cancellation confirmation email
    sendCancellationEmail(apt).catch(err => console.error('Cancellation email error:', err));

    res.json({
      success: true,
      message: 'Appointment cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel appointment'
    });
  }
});

// Function to send cancellation confirmation email
const sendCancellationEmail = async (appointment) => {
  const vars = makeVars(appointment);
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: appointment.email,
    subject: applyTemplate(getSetting('email_cancellation_subject', 'Appointment Cancelled - {clinic_name}'), vars),
    html:    applyTemplate(getSetting('email_cancellation_body',    DEFAULT_CANCELLATION_HTML), vars),
  });
  console.log('Cancellation email sent to:', appointment.email);
};

// ==================== SEARCH & FILTER ====================
// (Moved to before /api/appointments/:id route)

// ==================== RESCHEDULE APPOINTMENT ====================

// Reschedule an appointment
app.put('/api/appointments/:id/reschedule', async (req, res) => {
  try {
    const { id } = req.params;
    const { preferredDate, preferredTime } = req.body;

    if (!preferredDate || !preferredTime) {
      return res.status(400).json({
        success: false,
        message: 'New date and time are required'
      });
    }

    // Check if the new slot is available
    const overlapCheck = await pool.query(
      `SELECT * FROM appointments
       WHERE preferred_date = $1
       AND preferred_time = $2
       AND status != 'cancelled'
       AND id != $3`,
      [preferredDate, preferredTime, id]
    );

    if (overlapCheck.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'The selected time slot is not available'
      });
    }

    // Get the old appointment details for email
    const oldAppointment = await pool.query(
      'SELECT * FROM appointments WHERE id = $1',
      [id]
    );

    if (oldAppointment.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Update the appointment
    const result = await pool.query(
      `UPDATE appointments
       SET preferred_date = $1, preferred_time = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [preferredDate, preferredTime, id]
    );

    // Send reschedule confirmation email
    const appointment = result.rows[0];
    sendRescheduleEmail(appointment, oldAppointment.rows[0]).catch(err =>
      console.error('Reschedule email error:', err)
    );

    res.json({
      success: true,
      message: 'Appointment rescheduled successfully',
      appointment
    });
  } catch (error) {
    console.error('Reschedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reschedule appointment'
    });
  }
});

// Function to send reschedule email
const sendRescheduleEmail = async (newAppointment, oldAppointment) => {
  const vars = { ...makeVars(newAppointment), old_date: oldAppointment.preferred_date, old_time: oldAppointment.preferred_time };
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: newAppointment.email,
    subject: applyTemplate(getSetting('email_reschedule_subject', 'Appointment Rescheduled - {clinic_name}'), vars),
    html:    applyTemplate(getSetting('email_reschedule_body',    DEFAULT_RESCHEDULE_HTML), vars),
  });
  console.log('Reschedule email sent to:', newAppointment.email);
};

// ==================== REMINDER EMAILS ====================

// Function to send reminder email
const sendReminderEmail = async (appointment) => {
  const vars = makeVars(appointment);
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: appointment.email,
    subject: applyTemplate(getSetting('email_reminder_subject', 'Appointment Reminder - Tomorrow at {clinic_name}'), vars),
    html:    applyTemplate(getSetting('email_reminder_body',    DEFAULT_REMINDER_HTML), vars),
  });
  console.log('Reminder email sent to:', appointment.email);
};

// Check and send reminder emails (runs every hour)
const checkAndSendReminders = async () => {
  try {
    // Get tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    // Find appointments for tomorrow that haven't been reminded
    const result = await pool.query(
      `SELECT * FROM appointments
       WHERE preferred_date = $1
       AND status IN ('pending', 'confirmed')
       AND (reminder_sent IS NULL OR reminder_sent = false)`,
      [tomorrowStr]
    );

    for (const appointment of result.rows) {
      try {
        await sendReminderEmail(appointment);
        // Mark as reminded
        await pool.query(
          'UPDATE appointments SET reminder_sent = true WHERE id = $1',
          [appointment.id]
        );
      } catch (err) {
        console.error(`Failed to send reminder to ${appointment.email}:`, err);
      }
    }

    if (result.rows.length > 0) {
      console.log(`Sent ${result.rows.length} reminder emails`);
    }
  } catch (error) {
    console.error('Reminder check error:', error);
  }
};

// Run reminder check every hour
setInterval(checkAndSendReminders, 60 * 60 * 1000);

// Also run once on server start
setTimeout(checkAndSendReminders, 5000);

// ==================== BLOCKED DATES / HOLIDAYS ====================

// Get all blocked dates
app.get('/api/blocked-dates', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM blocked_dates ORDER BY blocked_date ASC'
    );
    res.json({ success: true, blockedDates: result.rows });
  } catch (error) {
    console.error('Error fetching blocked dates:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch blocked dates' });
  }
});

// Add a blocked date
app.post('/api/blocked-dates', async (req, res) => {
  try {
    const { blockedDate, reason } = req.body;

    if (!blockedDate) {
      return res.status(400).json({ success: false, message: 'Date is required' });
    }

    const result = await pool.query(
      'INSERT INTO blocked_dates (blocked_date, reason) VALUES ($1, $2) RETURNING *',
      [blockedDate, reason || 'Holiday/Clinic Closed']
    );

    res.status(201).json({ success: true, blockedDate: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ success: false, message: 'This date is already blocked' });
    }
    console.error('Error adding blocked date:', error);
    res.status(500).json({ success: false, message: 'Failed to add blocked date' });
  }
});

// Delete a blocked date
app.delete('/api/blocked-dates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM blocked_dates WHERE id = $1', [id]);
    res.json({ success: true, message: 'Blocked date removed' });
  } catch (error) {
    console.error('Error deleting blocked date:', error);
    res.status(500).json({ success: false, message: 'Failed to delete blocked date' });
  }
});

// ==================== DOCTORS MANAGEMENT ====================

// Get all doctors
app.get('/api/doctors', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM doctors ORDER BY name ASC'
    );
    res.json({ success: true, doctors: result.rows });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch doctors' });
  }
});

// Add a doctor
app.post('/api/doctors', async (req, res) => {
  try {
    const { name, specialization, color } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Doctor name is required' });
    }

    const result = await pool.query(
      'INSERT INTO doctors (name, specialization, color) VALUES ($1, $2, $3) RETURNING *',
      [name, specialization || 'General Practice', color || '#3B82F6']
    );

    res.status(201).json({ success: true, doctor: result.rows[0] });
  } catch (error) {
    console.error('Error adding doctor:', error);
    res.status(500).json({ success: false, message: 'Failed to add doctor' });
  }
});

// Update a doctor
app.put('/api/doctors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, specialization, color, active } = req.body;

    const result = await pool.query(
      `UPDATE doctors SET name = COALESCE($1, name), specialization = COALESCE($2, specialization),
       color = COALESCE($3, color), active = COALESCE($4, active), updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 RETURNING *`,
      [name, specialization, color, active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    res.json({ success: true, doctor: result.rows[0] });
  } catch (error) {
    console.error('Error updating doctor:', error);
    res.status(500).json({ success: false, message: 'Failed to update doctor' });
  }
});

// Delete a doctor
app.delete('/api/doctors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM doctors WHERE id = $1', [id]);
    res.json({ success: true, message: 'Doctor deleted' });
  } catch (error) {
    console.error('Error deleting doctor:', error);
    res.status(500).json({ success: false, message: 'Failed to delete doctor' });
  }
});

// ==================== SERVICES WITH DURATION ====================

// Get all services
app.get('/api/services', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM services WHERE active = true ORDER BY name ASC'
    );
    res.json({ success: true, services: result.rows });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch services' });
  }
});

// Add a service
app.post('/api/services', async (req, res) => {
  try {
    const { name, duration, price, description } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Service name is required' });
    }

    const result = await pool.query(
      'INSERT INTO services (name, duration, price, description) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, duration || 30, price || 0, description || '']
    );

    res.status(201).json({ success: true, service: result.rows[0] });
  } catch (error) {
    console.error('Error adding service:', error);
    res.status(500).json({ success: false, message: 'Failed to add service' });
  }
});

// Update a service
app.put('/api/services/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, duration, price, description, active } = req.body;

    const result = await pool.query(
      `UPDATE services SET name = COALESCE($1, name), duration = COALESCE($2, duration),
       price = COALESCE($3, price), description = COALESCE($4, description),
       active = COALESCE($5, active), updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 RETURNING *`,
      [name, duration, price, description, active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    res.json({ success: true, service: result.rows[0] });
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({ success: false, message: 'Failed to update service' });
  }
});

// Delete a service
app.delete('/api/services/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE services SET active = false WHERE id = $1', [id]);
    res.json({ success: true, message: 'Service deactivated' });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ success: false, message: 'Failed to delete service' });
  }
});

// ==================== REPORTS & ANALYTICS ====================


// Get CSM Analytics
app.get('/api/reports/csm', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let dateFilter = '';
    const params = [];
    if (startDate && endDate) {
      dateFilter = 'WHERE DATE(submitted_at) BETWEEN $1 AND $2';
      params.push(startDate, endDate);
    } else if (startDate) {
      dateFilter = 'WHERE DATE(submitted_at) >= $1';
      params.push(startDate);
    } else if (endDate) {
      dateFilter = 'WHERE DATE(submitted_at) <= $1';
      params.push(endDate);
    }

    const totalRes = await pool.query(`SELECT COUNT(*) as total FROM survey ${dateFilter}`, params);
    const total = parseInt(totalRes.rows[0].total) || 0;

    let csat = 0, nps = 0, sqdAverages = {};
    if (total > 0) {
      // CSAT: Rating 4 and 5
      const csatRes = await pool.query(`SELECT COUNT(*) as count FROM survey ${dateFilter ? dateFilter + ' AND' : 'WHERE'} sqd0 >= 4`, params);
      csat = Math.round((parseInt(csatRes.rows[0].count) / total) * 100);

      // NPS: Promoters (5) - Detractors (1-3)
      const promoters = await pool.query(`SELECT COUNT(*) as count FROM survey ${dateFilter ? dateFilter + ' AND' : 'WHERE'} sqd0 = 5`, params);
      const detractors = await pool.query(`SELECT COUNT(*) as count FROM survey ${dateFilter ? dateFilter + ' AND' : 'WHERE'} sqd0 <= 3`, params);
      nps = Math.round(((parseInt(promoters.rows[0].count) - parseInt(detractors.rows[0].count)) / total) * 100);

      const avgRes = await pool.query(`SELECT 
        AVG(sqd1) as sqd1, AVG(sqd2) as sqd2, AVG(sqd3) as sqd3, AVG(sqd4) as sqd4,
        AVG(sqd5) as sqd5, AVG(sqd6) as sqd6, AVG(sqd7) as sqd7, AVG(sqd8) as sqd8 
        FROM survey ${dateFilter}`, params);
      
      const row = avgRes.rows[0];
      sqdAverages = {
        "Responsiveness": parseFloat(row.sqd1||0).toFixed(2),
        "Reliability": parseFloat(row.sqd2||0).toFixed(2),
        "Access & Facilities": parseFloat(row.sqd3||0).toFixed(2),
        "Communication": parseFloat(row.sqd4||0).toFixed(2),
        "Costs": parseFloat(row.sqd5||0).toFixed(2),
        "Integrity": parseFloat(row.sqd6||0).toFixed(2),
        "Assurance": parseFloat(row.sqd7||0).toFixed(2),
        "Outcome": parseFloat(row.sqd8||0).toFixed(2)
      };
    }

    res.json({ success: true, csat, nps, total, sqdAverages });
  } catch (error) {
    console.error('CSM Report error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate CSM analytics' });
  }
});


// Get CSM Analytics
app.get('/api/reports/csm', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let dateFilter = '';
    const params = [];
    if (startDate && endDate) {
      dateFilter = 'WHERE DATE(submitted_at) BETWEEN $1 AND $2';
      params.push(startDate, endDate);
    } else if (startDate) {
      dateFilter = 'WHERE DATE(submitted_at) >= $1';
      params.push(startDate);
    } else if (endDate) {
      dateFilter = 'WHERE DATE(submitted_at) <= $1';
      params.push(endDate);
    }

    const totalRes = await pool.query(`SELECT COUNT(*) as total FROM survey ${dateFilter}`, params);
    const total = parseInt(totalRes.rows[0].total) || 0;

    let csat = 0, nps = 0, sqdAverages = {};
    if (total > 0) {
      // CSAT: Rating 4 and 5
      const csatRes = await pool.query(`SELECT COUNT(*) as count FROM survey ${dateFilter ? dateFilter + ' AND' : 'WHERE'} sqd0 >= 4`, params);
      csat = Math.round((parseInt(csatRes.rows[0].count) / total) * 100);

      // NPS: Promoters (5) - Detractors (1-3)
      const promoters = await pool.query(`SELECT COUNT(*) as count FROM survey ${dateFilter ? dateFilter + ' AND' : 'WHERE'} sqd0 = 5`, params);
      const detractors = await pool.query(`SELECT COUNT(*) as count FROM survey ${dateFilter ? dateFilter + ' AND' : 'WHERE'} sqd0 <= 3`, params);
      nps = Math.round(((parseInt(promoters.rows[0].count) - parseInt(detractors.rows[0].count)) / total) * 100);

      const avgRes = await pool.query(`SELECT 
        AVG(sqd1) as sqd1, AVG(sqd2) as sqd2, AVG(sqd3) as sqd3, AVG(sqd4) as sqd4,
        AVG(sqd5) as sqd5, AVG(sqd6) as sqd6, AVG(sqd7) as sqd7, AVG(sqd8) as sqd8 
        FROM survey ${dateFilter}`, params);
      
      const row = avgRes.rows[0];
      sqdAverages = {
        "Responsiveness": parseFloat(row.sqd1||0).toFixed(2),
        "Reliability": parseFloat(row.sqd2||0).toFixed(2),
        "Access & Facilities": parseFloat(row.sqd3||0).toFixed(2),
        "Communication": parseFloat(row.sqd4||0).toFixed(2),
        "Costs": parseFloat(row.sqd5||0).toFixed(2),
        "Integrity": parseFloat(row.sqd6||0).toFixed(2),
        "Assurance": parseFloat(row.sqd7||0).toFixed(2),
        "Outcome": parseFloat(row.sqd8||0).toFixed(2)
      };
    }

    res.json({ success: true, csat, nps, total, sqdAverages });
  } catch (error) {
    console.error('CSM Report error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate CSM analytics' });
  }
});


// Get CSM Analytics
app.get('/api/reports/csm', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let dateFilter = '';
    const params = [];
    if (startDate && endDate) {
      dateFilter = 'WHERE DATE(submitted_at) BETWEEN $1 AND $2';
      params.push(startDate, endDate);
    } else if (startDate) {
      dateFilter = 'WHERE DATE(submitted_at) >= $1';
      params.push(startDate);
    } else if (endDate) {
      dateFilter = 'WHERE DATE(submitted_at) <= $1';
      params.push(endDate);
    }

    const totalRes = await pool.query(`SELECT COUNT(*) as total FROM survey ${dateFilter}`, params);
    const total = parseInt(totalRes.rows[0].total) || 0;

    let csat = 0, nps = 0, sqdAverages = {};
    if (total > 0) {
      // CSAT: Rating 4 and 5
      const csatRes = await pool.query(`SELECT COUNT(*) as count FROM survey ${dateFilter ? dateFilter + ' AND' : 'WHERE'} sqd0 >= 4`, params);
      csat = Math.round((parseInt(csatRes.rows[0].count) / total) * 100);

      // NPS: Promoters (5) - Detractors (1-3)
      const promoters = await pool.query(`SELECT COUNT(*) as count FROM survey ${dateFilter ? dateFilter + ' AND' : 'WHERE'} sqd0 = 5`, params);
      const detractors = await pool.query(`SELECT COUNT(*) as count FROM survey ${dateFilter ? dateFilter + ' AND' : 'WHERE'} sqd0 <= 3`, params);
      nps = Math.round(((parseInt(promoters.rows[0].count) - parseInt(detractors.rows[0].count)) / total) * 100);

      const avgRes = await pool.query(`SELECT 
        AVG(sqd1) as sqd1, AVG(sqd2) as sqd2, AVG(sqd3) as sqd3, AVG(sqd4) as sqd4,
        AVG(sqd5) as sqd5, AVG(sqd6) as sqd6, AVG(sqd7) as sqd7, AVG(sqd8) as sqd8 
        FROM survey ${dateFilter}`, params);
      
      const row = avgRes.rows[0];
      sqdAverages = {
        "Responsiveness": parseFloat(row.sqd1||0).toFixed(2),
        "Reliability": parseFloat(row.sqd2||0).toFixed(2),
        "Access & Facilities": parseFloat(row.sqd3||0).toFixed(2),
        "Communication": parseFloat(row.sqd4||0).toFixed(2),
        "Costs": parseFloat(row.sqd5||0).toFixed(2),
        "Integrity": parseFloat(row.sqd6||0).toFixed(2),
        "Assurance": parseFloat(row.sqd7||0).toFixed(2),
        "Outcome": parseFloat(row.sqd8||0).toFixed(2)
      };
    }

    res.json({ success: true, csat, nps, total, sqdAverages });
  } catch (error) {
    console.error('CSM Report error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate CSM analytics' });
  }
});


// Get CSM Analytics
app.get('/api/reports/csm', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let dateFilter = '';
    const params = [];
    if (startDate && endDate) {
      dateFilter = 'WHERE DATE(submitted_at) BETWEEN $1 AND $2';
      params.push(startDate, endDate);
    } else if (startDate) {
      dateFilter = 'WHERE DATE(submitted_at) >= $1';
      params.push(startDate);
    } else if (endDate) {
      dateFilter = 'WHERE DATE(submitted_at) <= $1';
      params.push(endDate);
    }

    const totalRes = await pool.query(`SELECT COUNT(*) as total FROM survey ${dateFilter}`, params);
    const total = parseInt(totalRes.rows[0].total) || 0;

    let csat = 0, nps = 0, sqdAverages = {};
    if (total > 0) {
      // CSAT: Rating 4 and 5
      const csatRes = await pool.query(`SELECT COUNT(*) as count FROM survey ${dateFilter ? dateFilter + ' AND' : 'WHERE'} sqd0 >= 4`, params);
      csat = Math.round((parseInt(csatRes.rows[0].count) / total) * 100);

      // NPS: Promoters (5) - Detractors (1-3)
      const promoters = await pool.query(`SELECT COUNT(*) as count FROM survey ${dateFilter ? dateFilter + ' AND' : 'WHERE'} sqd0 = 5`, params);
      const detractors = await pool.query(`SELECT COUNT(*) as count FROM survey ${dateFilter ? dateFilter + ' AND' : 'WHERE'} sqd0 <= 3`, params);
      nps = Math.round(((parseInt(promoters.rows[0].count) - parseInt(detractors.rows[0].count)) / total) * 100);

      const avgRes = await pool.query(`SELECT 
        AVG(sqd1) as sqd1, AVG(sqd2) as sqd2, AVG(sqd3) as sqd3, AVG(sqd4) as sqd4,
        AVG(sqd5) as sqd5, AVG(sqd6) as sqd6, AVG(sqd7) as sqd7, AVG(sqd8) as sqd8 
        FROM survey ${dateFilter}`, params);
      
      const row = avgRes.rows[0];
      sqdAverages = {
        "Responsiveness": parseFloat(row.sqd1||0).toFixed(2),
        "Reliability": parseFloat(row.sqd2||0).toFixed(2),
        "Access & Facilities": parseFloat(row.sqd3||0).toFixed(2),
        "Communication": parseFloat(row.sqd4||0).toFixed(2),
        "Costs": parseFloat(row.sqd5||0).toFixed(2),
        "Integrity": parseFloat(row.sqd6||0).toFixed(2),
        "Assurance": parseFloat(row.sqd7||0).toFixed(2),
        "Outcome": parseFloat(row.sqd8||0).toFixed(2)
      };
    }

    res.json({ success: true, csat, nps, total, sqdAverages });
  } catch (error) {
    console.error('CSM Report error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate CSM analytics' });
  }
});


// Get CSM Analytics
app.get('/api/reports/csm', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let dateFilter = '';
    const params = [];
    if (startDate && endDate) {
      dateFilter = 'WHERE DATE(submitted_at) BETWEEN $1 AND $2';
      params.push(startDate, endDate);
    } else if (startDate) {
      dateFilter = 'WHERE DATE(submitted_at) >= $1';
      params.push(startDate);
    } else if (endDate) {
      dateFilter = 'WHERE DATE(submitted_at) <= $1';
      params.push(endDate);
    }

    const totalRes = await pool.query(`SELECT COUNT(*) as total FROM survey ${dateFilter}`, params);
    const total = parseInt(totalRes.rows[0].total) || 0;

    let csat = 0, nps = 0, sqdAverages = {};
    if (total > 0) {
      // CSAT: Rating 4 and 5
      const csatRes = await pool.query(`SELECT COUNT(*) as count FROM survey ${dateFilter ? dateFilter + ' AND' : 'WHERE'} sqd0 >= 4`, params);
      csat = Math.round((parseInt(csatRes.rows[0].count) / total) * 100);

      // NPS: Promoters (5) - Detractors (1-3)
      const promoters = await pool.query(`SELECT COUNT(*) as count FROM survey ${dateFilter ? dateFilter + ' AND' : 'WHERE'} sqd0 = 5`, params);
      const detractors = await pool.query(`SELECT COUNT(*) as count FROM survey ${dateFilter ? dateFilter + ' AND' : 'WHERE'} sqd0 <= 3`, params);
      nps = Math.round(((parseInt(promoters.rows[0].count) - parseInt(detractors.rows[0].count)) / total) * 100);

      const avgRes = await pool.query(`SELECT 
        AVG(sqd1) as sqd1, AVG(sqd2) as sqd2, AVG(sqd3) as sqd3, AVG(sqd4) as sqd4,
        AVG(sqd5) as sqd5, AVG(sqd6) as sqd6, AVG(sqd7) as sqd7, AVG(sqd8) as sqd8 
        FROM survey ${dateFilter}`, params);
      
      const row = avgRes.rows[0];
      sqdAverages = {
        "Responsiveness": parseFloat(row.sqd1||0).toFixed(2),
        "Reliability": parseFloat(row.sqd2||0).toFixed(2),
        "Access & Facilities": parseFloat(row.sqd3||0).toFixed(2),
        "Communication": parseFloat(row.sqd4||0).toFixed(2),
        "Costs": parseFloat(row.sqd5||0).toFixed(2),
        "Integrity": parseFloat(row.sqd6||0).toFixed(2),
        "Assurance": parseFloat(row.sqd7||0).toFixed(2),
        "Outcome": parseFloat(row.sqd8||0).toFixed(2)
      };
    }

    res.json({ success: true, csat, nps, total, sqdAverages });
  } catch (error) {
    console.error('CSM Report error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate CSM analytics' });
  }
});

// Get appointment statistics





app.get('/api/reports/stats', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = '';
    const params = [];

    if (startDate && endDate) {
      dateFilter = 'WHERE preferred_date BETWEEN $1 AND $2';
      params.push(startDate, endDate);
    } else if (startDate) {
      dateFilter = 'WHERE preferred_date >= $1';
      params.push(startDate);
    } else if (endDate) {
      dateFilter = 'WHERE preferred_date <= $1';
      params.push(endDate);
    }

    // Total appointments by status
    const statusStats = await pool.query(
      `SELECT status, COUNT(*) as count FROM appointments ${dateFilter} GROUP BY status`,
      params
    );

    // Appointments by service type
    const serviceStats = await pool.query(
      `SELECT service_type, COUNT(*) as count FROM appointments ${dateFilter} GROUP BY service_type ORDER BY count DESC`,
      params
    );

    // Daily appointment count (last 30 days)
    const dailyStats = await pool.query(
      `SELECT preferred_date as date, COUNT(*) as count
       FROM appointments
       WHERE preferred_date >= CURRENT_DATE - INTERVAL '30 days'
       GROUP BY preferred_date
       ORDER BY preferred_date ASC`
    );

    // Peak hours
    const hourlyStats = await pool.query(
      `SELECT preferred_time as time, COUNT(*) as count
       FROM appointments ${dateFilter}
       GROUP BY preferred_time
       ORDER BY count DESC`,
      params
    );

    // Total counts
    const totals = await pool.query(
      `SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed
       FROM appointments ${dateFilter}`,
      params
    );

    res.json({
      success: true,
      stats: {
        totals: totals.rows[0],
        byStatus: statusStats.rows,
        byService: serviceStats.rows,
        daily: dailyStats.rows,
        hourly: hourlyStats.rows
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch statistics' });
  }
});

// ==================== EXPORT TO CSV ====================

// Export appointments to CSV
app.get('/api/export/appointments', async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;

    let sql = 'SELECT * FROM appointments WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (startDate) {
      sql += ` AND preferred_date >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      sql += ` AND preferred_date <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    if (status && status !== 'all') {
      sql += ` AND status = $${paramIndex}`;
      params.push(status);
    }

    sql += ' ORDER BY preferred_date DESC, preferred_time DESC';

    const result = await pool.query(sql, params);

    // Convert to CSV
    const headers = ['ID', 'Full Name', 'Phone', 'Email', 'Service', 'Date', 'Time', 'Status', 'Notes', 'Created At'];
    const csvRows = [headers.join(',')];

    result.rows.forEach(row => {
      const values = [
        row.id,
        `"${row.full_name}"`,
        row.phone_number,
        row.email,
        `"${row.service_type}"`,
        row.preferred_date,
        row.preferred_time,
        row.status,
        `"${(row.notes || '').replace(/"/g, '""')}"`,
        row.created_at
      ];
      csvRows.push(values.join(','));
    });

    const csv = csvRows.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=appointments_${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csv);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ success: false, message: 'Failed to export data' });
  }
});

// ==================== CALENDAR DATA ====================

// Get appointments for calendar view
app.get('/api/calendar', async (req, res) => {
  try {
    const { month, year } = req.query;

    const startDate = `${year}-${month.padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    const appointments = await pool.query(
      `SELECT id, full_name, service_type, preferred_date, preferred_time, status
       FROM appointments
       WHERE preferred_date >= $1 AND preferred_date <= $2
       ORDER BY preferred_date, preferred_time`,
      [startDate, endDate]
    );

    const blockedDates = await pool.query(
      `SELECT blocked_date, reason FROM blocked_dates
       WHERE blocked_date >= $1 AND blocked_date <= $2`,
      [startDate, endDate]
    );

    res.json({
      success: true,
      appointments: appointments.rows,
      blockedDates: blockedDates.rows
    });
  } catch (error) {
    console.error('Calendar error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch calendar data' });
  }
});

// ==================== SEND SMS NOTIFICATION ====================

// Send SMS reminder manually
app.post('/api/send-sms', async (req, res) => {
  try {
    const { appointmentId, message } = req.body;

    const appointment = await pool.query(
      'SELECT * FROM appointments WHERE id = $1',
      [appointmentId]
    );

    if (appointment.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const apt = appointment.rows[0];
    const smsTplReminder = getSetting('sms_reminder', 'Hi {name}, reminder: Your appointment at {clinic_name} is on {date} at {time}. Ref#{ref}');
    const smsMessage = message || applyTemplate(smsTplReminder, makeVars(apt));

    const sent = await sendSMS(apt.phone_number, smsMessage);

    if (sent) {
      res.json({ success: true, message: 'SMS sent successfully' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to send SMS. Check API key configuration.' });
    }
  } catch (error) {
    console.error('SMS send error:', error);
    res.status(500).json({ success: false, message: 'Failed to send SMS' });
  }
});

// ==================== QUEUE SYSTEM ENDPOINTS ====================

// Get active transaction types
app.get('/api/queue/transaction-types', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM queue_transaction_types WHERE active = true ORDER BY name');
    res.json({ success: true, types: result.rows });
  } catch (error) {
    console.error('Error fetching transaction types:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch transaction types' });
  }
});

// Create a queue ticket
app.post('/api/queue/tickets', async (req, res) => {
  try {
    const { customerName, cellphoneNumber, transactionType, isPriority, priorityType } = req.body;

    // Get prefix for this transaction type
    const typeResult = await pool.query(
      'SELECT prefix FROM queue_transaction_types WHERE name = $1 AND active = true',
      [transactionType]
    );
    const prefix = typeResult.rows.length > 0 ? typeResult.rows[0].prefix : 'GN';

    // Get next number for this transaction type today
    const countResult = await pool.query(
      "SELECT COUNT(*) as count FROM queue_tickets WHERE transaction_type = $1 AND queue_date = CURRENT_DATE",
      [transactionType]
    );
    const nextNum = parseInt(countResult.rows[0].count) + 1;
    const ticketNumber = `${prefix}-${String(nextNum).padStart(3, '0')}`;

    // Get queue position (how many waiting ahead)
    const posResult = await pool.query(
      "SELECT COUNT(*) as count FROM queue_tickets WHERE status = 'waiting' AND queue_date = CURRENT_DATE"
    );
    const position = parseInt(posResult.rows[0].count) + 1;

    const result = await pool.query(
      `INSERT INTO queue_tickets (ticket_number, customer_name, cellphone_number, transaction_type, status, queue_date, is_priority, priority_type)
       VALUES ($1, $2, $3, $4, 'waiting', CURRENT_DATE, $5, $6) RETURNING *`,
      [ticketNumber, customerName, cellphoneNumber, transactionType, isPriority || false, priorityType || null]
    );

    res.json({ success: true, ticket: result.rows[0], position });
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ success: false, message: 'Failed to create ticket' });
  }
});

// Get queue display data (public)

// Batch generate manual tickets
app.post('/api/queue/batch-generate', async (req, res) => {
  const client = await pool.connect();
  try {
    const { start, end, prefix, transactionType } = req.body;
    const startNum = parseInt(start);
    const endNum = parseInt(end);

    if (isNaN(startNum) || isNaN(endNum) || startNum > endNum) {
      return res.status(400).json({ success: false, message: 'Invalid range' });
    }

    await client.query('BEGIN');
    const createdTickets = [];

    for (let i = startNum; i <= endNum; i++) {
        const ticketNumber = `${prefix || 'M'}-${String(i).padStart(3, '0')}`;
        const result = await client.query(
            `INSERT INTO queue_tickets (ticket_number, customer_name, cellphone_number, transaction_type, status, queue_date)
             VALUES ($1, $2, $3, $4, 'waiting', CURRENT_DATE) RETURNING *`,
            [ticketNumber, 'Manual Ticket', '', transactionType || 'Manual']
        );
        createdTickets.push(result.rows[0]);
    }

    await client.query('COMMIT');
    res.json({ success: true, count: createdTickets.length });
  } catch (error) {
    if (client) await client.query('ROLLBACK');
    console.error('Batch error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate batch' });
  } finally {
    if (client) client.release();
  }
});



app.get('/api/queue/display', async (req, res) => {
  try {
    const serving = await pool.query(
      "SELECT * FROM queue_tickets WHERE status = 'serving' AND queue_date = CURRENT_DATE ORDER BY called_at DESC"
    );
    const waiting = await pool.query(
      "SELECT * FROM queue_tickets WHERE status = 'waiting' AND queue_date = CURRENT_DATE ORDER BY is_priority DESC, created_at ASC"
    );

    // Calculate average serving time from today's completed tickets
    const avgResult = await pool.query(
      `SELECT AVG(EXTRACT(EPOCH FROM (completed_at - called_at))) as avg_seconds
       FROM queue_tickets
       WHERE status = 'completed' AND queue_date = CURRENT_DATE
       AND completed_at IS NOT NULL AND called_at IS NOT NULL`
    );
    const avgServingTime = Math.round(avgResult.rows[0].avg_seconds) || 300; // default 5 min

    // Add estimated wait time to each waiting ticket based on position
    const waitingWithEstimates = waiting.rows.map((ticket, index) => ({
      ...ticket,
      estimatedWait: (index + 1) * avgServingTime
    }));

    res.json({ success: true, serving: serving.rows, waiting: waitingWithEstimates, avgServingTime });
  } catch (error) {
    console.error('Error fetching display data:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch display data' });
  }
});

// Get all teller windows
app.get('/api/queue/tellers', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.*,
        COALESCE(
          json_agg(json_build_object('id', tt.id, 'name', tt.name, 'prefix', tt.prefix))
          FILTER (WHERE tt.id IS NOT NULL), '[]'
        ) as assigned_types
      FROM queue_tellers t
      LEFT JOIN queue_window_transactions wt ON t.id = wt.teller_id
      LEFT JOIN queue_transaction_types tt ON wt.transaction_type_id = tt.id AND tt.active = true
      WHERE t.is_active = true
      GROUP BY t.id
      ORDER BY t.window_name
    `);
    res.json({ success: true, tellers: result.rows });
  } catch (error) {
    console.error('Error fetching tellers:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch tellers' });
  }
});

// Get current ticket for a teller window
app.get('/api/queue/teller/:windowName/current', async (req, res) => {
  try {
    const { windowName } = req.params;
    const result = await pool.query(
      "SELECT * FROM queue_tickets WHERE teller_window = $1 AND status = 'serving' AND queue_date = CURRENT_DATE LIMIT 1",
      [windowName]
    );
    const skipped = await pool.query(
      "SELECT * FROM queue_tickets WHERE teller_window = $1 AND status = 'skipped' AND queue_date = CURRENT_DATE ORDER BY called_at DESC",
      [windowName]
    );
    const completedCount = await pool.query(
      "SELECT COUNT(*) as count FROM queue_tickets WHERE teller_window = $1 AND status = 'completed' AND queue_date = CURRENT_DATE",
      [windowName]
    );
    // Get assigned transaction types for this window
    const assignedTypes = await pool.query(
      `SELECT tt.name FROM queue_window_transactions wt
       JOIN queue_tellers t ON wt.teller_id = t.id
       JOIN queue_transaction_types tt ON wt.transaction_type_id = tt.id
       WHERE t.window_name = $1 AND t.is_active = true AND tt.active = true`,
      [windowName]
    );
    const typeNames = assignedTypes.rows.map(r => r.name);

    // Filter waiting tickets by assigned types if any
    let waitingTickets;
    if (typeNames.length > 0) {
      waitingTickets = await pool.query(
        "SELECT * FROM queue_tickets WHERE status = 'waiting' AND queue_date = CURRENT_DATE AND transaction_type = ANY($1::text[]) ORDER BY is_priority DESC, created_at ASC",
        [typeNames]
      );
    } else {
      waitingTickets = await pool.query(
        "SELECT * FROM queue_tickets WHERE status = 'waiting' AND queue_date = CURRENT_DATE ORDER BY is_priority DESC, created_at ASC"
      );
    }
    // Average serving time for this window today
    const avgServing = await pool.query(
      `SELECT AVG(EXTRACT(EPOCH FROM (completed_at - called_at))) as avg_seconds
       FROM queue_tickets
       WHERE teller_window = $1 AND status = 'completed' AND queue_date = CURRENT_DATE
       AND completed_at IS NOT NULL AND called_at IS NOT NULL`,
      [windowName]
    );

    res.json({
      success: true,
      current: result.rows[0] || null,
      skipped: skipped.rows,
      completedCount: parseInt(completedCount.rows[0].count),
      waitingCount: waitingTickets.rows.length,
      waitingTickets: waitingTickets.rows,
      assignedTypes: typeNames,
      avgServingTime: Math.round(avgServing.rows[0].avg_seconds) || 0
    });
  } catch (error) {
    console.error('Error fetching teller current:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch current ticket' });
  }
});

// Teller calls next ticket
app.post('/api/queue/teller/next', async (req, res) => {
  try {
    const { windowName, tellerName } = req.body;

    // Check if teller already has a serving ticket
    const existing = await pool.query(
      "SELECT * FROM queue_tickets WHERE teller_window = $1 AND status = 'serving' AND queue_date = CURRENT_DATE",
      [windowName]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Please complete or skip the current ticket first' });
    }

    // Get assigned transaction types for this window
    const assignedTypes = await pool.query(
      `SELECT tt.name FROM queue_window_transactions wt
       JOIN queue_tellers t ON wt.teller_id = t.id
       JOIN queue_transaction_types tt ON wt.transaction_type_id = tt.id
       WHERE t.window_name = $1 AND t.is_active = true AND tt.active = true`,
      [windowName]
    );
    const typeNames = assignedTypes.rows.map(r => r.name);

    // Get next waiting ticket (Priority first, then FIFO), filtered by assigned types if any
    let next;
    if (typeNames.length > 0) {
      next = await pool.query(
        "SELECT * FROM queue_tickets WHERE status = 'waiting' AND queue_date = CURRENT_DATE AND transaction_type = ANY($1::text[]) ORDER BY is_priority DESC, created_at ASC LIMIT 1",
        [typeNames]
      );
    } else {
      next = await pool.query(
        "SELECT * FROM queue_tickets WHERE status = 'waiting' AND queue_date = CURRENT_DATE ORDER BY is_priority DESC, created_at ASC LIMIT 1"
      );
    }

    if (next.rows.length === 0) {
      return res.json({ success: false, message: typeNames.length > 0 ? 'No matching tickets waiting for this window' : 'No tickets waiting in queue' });
    }

    const ticket = next.rows[0];
    const result = await pool.query(
      "UPDATE queue_tickets SET status = 'serving', teller_window = $1, teller_name = $2, called_at = NOW() WHERE id = $3 RETURNING *",
      [windowName, tellerName || null, ticket.id]
    );

    res.json({ success: true, ticket: result.rows[0] });
  } catch (error) {
    console.error('Error calling next ticket:', error);
    res.status(500).json({ success: false, message: 'Failed to call next ticket' });
  }
});

// Complete a ticket
// Re-announce a ticket (broadcasts to display board via WebSocket)
app.post('/api/queue/tickets/:id/reannounce', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM queue_tickets WHERE id = $1', [id]);
    if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Ticket not found' });
    wsBroadcast({ type: 'reannounce', ticket: result.rows[0] });
    res.json({ success: true });
  } catch (error) {
    console.error('Error re-announcing ticket:', error);
    res.status(500).json({ success: false, message: 'Failed to re-announce ticket' });
  }
});

// Void a ticket
app.patch('/api/queue/tickets/:id/void', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, note } = req.body;
    if (!reason) return res.status(400).json({ success: false, message: 'Void reason is required' });

    // Ensure columns exist (safe migration)
    await pool.query(`ALTER TABLE queue_tickets ADD COLUMN IF NOT EXISTS void_reason TEXT`);
    await pool.query(`ALTER TABLE queue_tickets ADD COLUMN IF NOT EXISTS void_note TEXT`);

    const result = await pool.query(
      "UPDATE queue_tickets SET status = 'voided', completed_at = NOW(), void_reason = $1, void_note = $2 WHERE id = $3 RETURNING *",
      [reason, note || null, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Ticket not found' });
    res.json({ success: true, ticket: result.rows[0] });
  } catch (error) {
    console.error('Error voiding ticket:', error);
    res.status(500).json({ success: false, message: 'Failed to void ticket' });
  }
});

app.patch('/api/queue/tickets/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "UPDATE queue_tickets SET status = 'completed', completed_at = NOW() WHERE id = $1 RETURNING *",
      [id]
    );
    res.json({ success: true, ticket: result.rows[0] });
  } catch (error) {
    console.error('Error completing ticket:', error);
    res.status(500).json({ success: false, message: 'Failed to complete ticket' });
  }
});

// Skip a ticket
app.patch('/api/queue/tickets/:id/skip', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "UPDATE queue_tickets SET status = 'skipped' WHERE id = $1 RETURNING *",
      [id]
    );
    res.json({ success: true, ticket: result.rows[0] });
  } catch (error) {
    console.error('Error skipping ticket:', error);
    res.status(500).json({ success: false, message: 'Failed to skip ticket' });
  }
});

// Recall a skipped ticket
app.patch('/api/queue/tickets/:id/recall', async (req, res) => {
  try {
    const { id } = req.params;
    const { windowName, tellerName } = req.body;

    // Check if teller already serving
    const existing = await pool.query(
      "SELECT * FROM queue_tickets WHERE teller_window = $1 AND status = 'serving' AND queue_date = CURRENT_DATE",
      [windowName]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Please complete or skip the current ticket first' });
    }

    const result = await pool.query(
      "UPDATE queue_tickets SET status = 'serving', teller_window = $1, teller_name = $2, called_at = NOW() WHERE id = $3 AND status = 'skipped' RETURNING *",
      [windowName, tellerName || null, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Ticket not found or not skipped' });
    }
    res.json({ success: true, ticket: result.rows[0] });
  } catch (error) {
    console.error('Error recalling ticket:', error);
    res.status(500).json({ success: false, message: 'Failed to recall ticket' });
  }
});

// Transfer a ticket to another teller window
app.patch('/api/queue/tickets/:id/transfer', async (req, res) => {
  try {
    const { id } = req.params;
    const { targetWindow } = req.body;

    if (!targetWindow) {
      return res.status(400).json({ success: false, message: 'Target window is required' });
    }

    // Check if target window already has a serving ticket
    const existing = await pool.query(
      "SELECT * FROM queue_tickets WHERE teller_window = $1 AND status = 'serving' AND queue_date = CURRENT_DATE",
      [targetWindow]
    );

    if (existing.rows.length > 0) {
      // Target window is busy Ã¢â‚¬â€ put ticket back to waiting, it will be next in line
      const result = await pool.query(
        "UPDATE queue_tickets SET status = 'waiting', teller_window = NULL, called_at = NULL WHERE id = $1 AND status = 'serving' RETURNING *",
        [id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Ticket not found or not currently being served' });
      }
      res.json({ success: true, ticket: result.rows[0], message: `Ticket transferred. ${targetWindow} is busy, ticket is back in the waiting queue.` });
    } else {
      // Target window is free Ã¢â‚¬â€ assign directly
      const result = await pool.query(
        "UPDATE queue_tickets SET status = 'serving', teller_window = $1, called_at = NOW() WHERE id = $2 AND status = 'serving' RETURNING *",
        [targetWindow, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Ticket not found or not currently being served' });
      }
      res.json({ success: true, ticket: result.rows[0], message: `Ticket transferred to ${targetWindow} and is now being served.` });
    }
  } catch (error) {
    console.error('Error transferring ticket:', error);
    res.status(500).json({ success: false, message: 'Failed to transfer ticket' });
  }
});

// Get all today's tickets (admin)
app.get('/api/queue/tickets', async (req, res) => {
  try {
    const tickets = await pool.query(
      "SELECT * FROM queue_tickets WHERE queue_date = CURRENT_DATE ORDER BY created_at ASC"
    );
    const stats = await pool.query(
      `SELECT
        COUNT(*) FILTER (WHERE status = 'waiting') as waiting,
        COUNT(*) FILTER (WHERE status = 'serving') as serving,
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(*) FILTER (WHERE status = 'skipped') as skipped,
        COUNT(*) as total
       FROM queue_tickets WHERE queue_date = CURRENT_DATE`
    );
    res.json({ success: true, tickets: tickets.rows, stats: stats.rows[0] });
  } catch (error) {
    console.error('Error fetching queue tickets:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch tickets' });
  }
});

// Batch issue tickets by range (staff/reception)
app.post('/api/queue/batch-issue', async (req, res) => {
  try {
    const { transactionType, from, to } = req.body;

    const fromNum = parseInt(from);
    const toNum = parseInt(to);

    if (!transactionType || isNaN(fromNum) || isNaN(toNum) || fromNum < 1 || toNum < fromNum) {
      return res.status(400).json({ success: false, message: 'Invalid range or transaction type.' });
    }
    if (toNum - fromNum + 1 > 200) {
      return res.status(400).json({ success: false, message: 'Batch cannot exceed 200 tickets.' });
    }

    // Get prefix for this transaction type
    const typeResult = await pool.query(
      'SELECT prefix FROM queue_transaction_types WHERE name = $1 AND active = true',
      [transactionType]
    );
    const prefix = typeResult.rows.length > 0 ? typeResult.rows[0].prefix : 'GN';

    // Find which numbers in the range already exist today to avoid duplicates
    const existing = await pool.query(
      "SELECT ticket_number FROM queue_tickets WHERE transaction_type = $1 AND queue_date = CURRENT_DATE",
      [transactionType]
    );
    const existingNums = new Set(existing.rows.map(r => r.ticket_number));

    const created = [];
    const skipped = [];

    for (let num = fromNum; num <= toNum; num++) {
      const ticketNumber = `${prefix}-${String(num).padStart(3, '0')}`;
      if (existingNums.has(ticketNumber)) {
        skipped.push(ticketNumber);
        continue;
      }
      const result = await pool.query(
        `INSERT INTO queue_tickets (ticket_number, customer_name, cellphone_number, transaction_type, status, queue_date, is_priority, priority_type)
         VALUES ($1, 'Walk-in', '', $2, 'waiting', CURRENT_DATE, false, null) RETURNING *`,
        [ticketNumber, transactionType]
      );
      created.push(result.rows[0]);
    }

    res.json({ success: true, created, skipped, total: created.length });
  } catch (error) {
    console.error('Error creating batch tickets:', error);
    res.status(500).json({ success: false, message: 'Failed to create batch tickets' });
  }
});

// Reset today's queue (admin)
app.post('/api/queue/reset', async (req, res) => {
  try {
    await pool.query("DELETE FROM queue_tickets WHERE queue_date = CURRENT_DATE");
    res.json({ success: true, message: 'Queue has been reset' });
  } catch (error) {
    console.error('Error resetting queue:', error);
    res.status(500).json({ success: false, message: 'Failed to reset queue' });
  }
});

// Add transaction type (admin)
app.post('/api/queue/transaction-types', async (req, res) => {
  try {
    const { name, prefix } = req.body;
    const result = await pool.query(
      'INSERT INTO queue_transaction_types (name, prefix) VALUES ($1, $2) RETURNING *',
      [name, prefix.toUpperCase()]
    );
    res.json({ success: true, type: result.rows[0] });
  } catch (error) {
    console.error('Error adding transaction type:', error);
    res.status(500).json({ success: false, message: 'Failed to add transaction type' });
  }
});

// Delete transaction type (admin)
app.delete('/api/queue/transaction-types/:id', async (req, res) => {
  try {
    await pool.query('UPDATE queue_transaction_types SET active = false WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'Transaction type removed' });
  } catch (error) {
    console.error('Error deleting transaction type:', error);
    res.status(500).json({ success: false, message: 'Failed to delete transaction type' });
  }
});

// Add teller window (admin)
app.post('/api/queue/tellers', async (req, res) => {
  try {
    const { windowName } = req.body;
    const result = await pool.query(
      'INSERT INTO queue_tellers (window_name) VALUES ($1) RETURNING *',
      [windowName]
    );
    res.json({ success: true, teller: result.rows[0] });
  } catch (error) {
    console.error('Error adding teller:', error);
    res.status(500).json({ success: false, message: 'Failed to add teller window' });
  }
});

// Delete teller window (admin)
app.delete('/api/queue/tellers/:id', async (req, res) => {
  try {
    await pool.query('UPDATE queue_tellers SET is_active = false WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'Teller window removed' });
  } catch (error) {
    console.error('Error deleting teller:', error);
    res.status(500).json({ success: false, message: 'Failed to delete teller window' });
  }
});

// Get marquee text
app.get('/api/queue/marquee', async (req, res) => {
  try {
    const result = await pool.query("SELECT value FROM queue_settings WHERE key = 'marquee_text'");
    res.json({ success: true, text: result.rows[0]?.value || '' });
  } catch (error) {
    console.error('Error fetching marquee:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch marquee text' });
  }
});

// Get default queue display template
app.get('/api/queue/display-template', async (req, res) => {
  try {
    const result = await pool.query("SELECT value FROM queue_settings WHERE key = 'display_template'");
    const template = result.rows[0]?.value || 'template1';
    res.json({ success: true, template });
  } catch (error) {
    console.error('Error fetching display template:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch display template' });
  }
});

// Update marquee text
// Update window-transaction assignments
app.put('/api/queue/window-transactions/:tellerId', async (req, res) => {
  try {
    const { tellerId } = req.params;
    const { transactionTypeIds } = req.body;

    // Delete existing assignments
    await pool.query('DELETE FROM queue_window_transactions WHERE teller_id = $1', [tellerId]);

    // Insert new assignments
    if (transactionTypeIds && transactionTypeIds.length > 0) {
      const values = transactionTypeIds.map((_, i) => `($1, $${i + 2})`).join(', ');
      await pool.query(
        `INSERT INTO queue_window_transactions (teller_id, transaction_type_id) VALUES ${values}`,
        [tellerId, ...transactionTypeIds]
      );
    }

    res.json({ success: true, message: 'Window assignments updated' });
  } catch (error) {
    console.error('Error updating window assignments:', error);
    res.status(500).json({ success: false, message: 'Failed to update assignments' });
  }
});

app.put('/api/queue/marquee', async (req, res) => {
  try {
    const { text } = req.body;
    await pool.query(
      "INSERT INTO queue_settings (key, value) VALUES ('marquee_text', $1) ON CONFLICT (key) DO UPDATE SET value = $1",
      [text]
    );
    res.json({ success: true, message: 'Marquee text updated' });
  } catch (error) {
    console.error('Error updating marquee:', error);
    res.status(500).json({ success: false, message: 'Failed to update marquee text' });
  }
});

// Update default queue display template
app.put('/api/queue/display-template', async (req, res) => {
  try {
    const { template } = req.body;
    const allowed = ['template1', 'template2', 'template3', 'template4', 'template5', 'template6'];
    if (!allowed.includes(template)) {
      return res.status(400).json({ success: false, message: 'Invalid template value' });
    }

    await pool.query(
      "INSERT INTO queue_settings (key, value) VALUES ('display_template', $1) ON CONFLICT (key) DO UPDATE SET value = $1",
      [template]
    );
    res.json({ success: true, message: 'Display template updated' });
  } catch (error) {
    console.error('Error updating display template:', error);
    res.status(500).json({ success: false, message: 'Failed to update display template' });
  }
});

// Queue Reports
app.get('/api/queue/reports', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate || new Date().toISOString().split('T')[0];
    const end = endDate || new Date().toISOString().split('T')[0];

    // Summary stats
    const summary = await pool.query(
      `SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(*) FILTER (WHERE status = 'skipped') as skipped,
        COUNT(*) FILTER (WHERE is_priority = true) as priority_count,
        AVG(EXTRACT(EPOCH FROM (called_at - created_at))) FILTER (WHERE called_at IS NOT NULL) as avg_wait_time,
        AVG(EXTRACT(EPOCH FROM (completed_at - called_at))) FILTER (WHERE completed_at IS NOT NULL AND called_at IS NOT NULL) as avg_serving_time
      FROM queue_tickets
      WHERE queue_date >= $1 AND queue_date <= $2`,
      [start, end]
    );

    // Peak hour
    const peakHour = await pool.query(
      `SELECT EXTRACT(HOUR FROM created_at)::int as hour, COUNT(*) as count
       FROM queue_tickets
       WHERE queue_date >= $1 AND queue_date <= $2
       GROUP BY hour ORDER BY count DESC LIMIT 1`,
      [start, end]
    );

    // By transaction type
    const byType = await pool.query(
      `SELECT transaction_type as type, COUNT(*) as count,
        AVG(EXTRACT(EPOCH FROM (called_at - created_at))) FILTER (WHERE called_at IS NOT NULL) as avg_wait
       FROM queue_tickets
       WHERE queue_date >= $1 AND queue_date <= $2
       GROUP BY transaction_type ORDER BY count DESC`,
      [start, end]
    );

    // By day
    const byDay = await pool.query(
      `SELECT queue_date as date, COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'completed') as completed
       FROM queue_tickets
       WHERE queue_date >= $1 AND queue_date <= $2
       GROUP BY queue_date ORDER BY queue_date`,
      [start, end]
    );

    // By hour
    const byHour = await pool.query(
      `SELECT EXTRACT(HOUR FROM created_at)::int as hour, COUNT(*) as count
       FROM queue_tickets
       WHERE queue_date >= $1 AND queue_date <= $2
       GROUP BY hour ORDER BY hour`,
      [start, end]
    );

    const s = summary.rows[0];
    res.json({
      success: true,
      summary: {
        totalTickets: parseInt(s.total),
        completed: parseInt(s.completed),
        skipped: parseInt(s.skipped),
        priorityCount: parseInt(s.priority_count),
        avgWaitTime: Math.round(s.avg_wait_time) || 0,
        avgServingTime: Math.round(s.avg_serving_time) || 0,
        peakHour: peakHour.rows[0]?.hour ?? null
      },
      byTransactionType: byType.rows.map(r => ({
        type: r.type,
        count: parseInt(r.count),
        avgWait: Math.round(r.avg_wait) || 0
      })),
      byDay: byDay.rows.map(r => ({
        date: r.date,
        total: parseInt(r.total),
        completed: parseInt(r.completed)
      })),
      byHour: byHour.rows.map(r => ({
        hour: parseInt(r.hour),
        count: parseInt(r.count)
      }))
    });
  } catch (error) {
    console.error('Error fetching queue reports:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch reports' });
  }
});

// Corporate Accounts
app.get('/api/corporate-accounts', async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM corporate_accounts ORDER BY created_at DESC");
    res.json({ success: true, accounts: rows });
  } catch (error) {
    console.error('Error fetching corporate accounts:', error);
    res.status(500).json({ success: false });
  }
});

app.post('/api/corporate-accounts', async (req, res) => {
  try {
    const { account_number, company_name, contact_person, contact_email, contact_phone, credit_limit } = req.body;
    
    // Explicit check for unique account number
    const existing = await pool.query('SELECT id FROM corporate_accounts WHERE account_number = $1', [account_number]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: `Account number ${account_number} already exists.` });
    }

    await pool.query(
      `INSERT INTO corporate_accounts (account_number, company_name, contact_person, contact_email, contact_phone, credit_limit) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [account_number, company_name, contact_person, contact_email, contact_phone, credit_limit || 0]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error creating corporate account:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/corporate-accounts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { account_number, company_name, contact_person, contact_email, contact_phone, credit_limit, status } = req.body;
    await pool.query(
      `UPDATE corporate_accounts 
       SET account_number = $1, company_name = $2, contact_person = $3, contact_email = $4, contact_phone = $5, credit_limit = $6, status = $7
       WHERE id = $8`,
      [account_number, company_name, contact_person, contact_email, contact_phone, credit_limit, status, id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating corporate account:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete('/api/corporate-accounts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM corporate_accounts WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting corporate account:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});






// Queue CSV Export
app.get('/api/export/queue-tickets', async (req, res) => {
  try {
    const { startDate, endDate, status, transactionType } = req.query;

    let sql = 'SELECT * FROM queue_tickets WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (startDate) {
      sql += ` AND queue_date >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }
    if (endDate) {
      sql += ` AND queue_date <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }
    if (status && status !== 'all') {
      sql += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    if (transactionType && transactionType !== 'all') {
      sql += ` AND transaction_type = $${paramIndex}`;
      params.push(transactionType);
    }

    sql += ' ORDER BY queue_date DESC, created_at DESC';

    const result = await pool.query(sql, params);

    const headers = ['Ticket #', 'Customer Name', 'Phone', 'Transaction Type', 'Status', 'Priority', 'Window', 'Teller', 'Date', 'Created At', 'Called At', 'Completed At', 'Wait Time (s)', 'Serving Time (s)'];
    const csvRows = [headers.join(',')];

    result.rows.forEach(row => {
      const waitTime = row.called_at && row.created_at ? Math.round((new Date(row.called_at) - new Date(row.created_at)) / 1000) : '';
      const servingTime = row.completed_at && row.called_at ? Math.round((new Date(row.completed_at) - new Date(row.called_at)) / 1000) : '';
      const values = [
        row.ticket_number,
        `"${(row.customer_name || '').replace(/"/g, '""')}"`,
        row.cellphone_number,
        `"${row.transaction_type}"`,
        row.status,
        row.is_priority ? (row.priority_type || 'Yes') : 'No',
        row.teller_window || '',
        `"${(row.teller_name || '').replace(/"/g, '""')}"`,
        row.queue_date,
        row.created_at,
        row.called_at || '',
        row.completed_at || '',
        waitTime,
        servingTime
      ];
      csvRows.push(values.join(','));
    });

    const csv = csvRows.join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=queue_tickets_${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csv);
  } catch (error) {
    console.error('Queue export error:', error);
    res.status(500).json({ success: false, message: 'Failed to export queue data' });
  }
});

// Survey submission
app.post('/api/survey', async (req, res) => {
  try {
    const { name, age, sex, region, contactNumber, serviceAvailed, clientType,
            cc1, cc2, cc3, cc3Reason,
            sqd0, sqd1, sqd2, sqd3, sqd4, sqd5, sqd6, sqd7, sqd8,
            suggestions } = req.body;
    await pool.query(
      `INSERT INTO survey (name, age, sex, region, contact_number, service_availed, client_type,
        cc1, cc2, cc3, cc3_reason,
        sqd0, sqd1, sqd2, sqd3, sqd4, sqd5, sqd6, sqd7, sqd8, suggestions)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)`,
      [name, age, sex, region, contactNumber, serviceAvailed, clientType,
       cc1, cc2, cc3, cc3Reason,
       sqd0, sqd1, sqd2, sqd3, sqd4, sqd5, sqd6, sqd7, sqd8, suggestions]
    );
    res.json({ success: true, message: 'Thank you for your feedback!' });
  } catch (error) {
    console.error('Survey error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit feedback.' });
  }
});

// ==================== SPECIALIST ENDPOINTS ====================

app.get('/api/specialists', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM booking_specialists ORDER BY name ASC');
    res.json({ success: true, specialists: rows });
  } catch (error) {
    console.error('Error fetching specialists:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch specialists' });
  }
});

app.post('/api/specialists', async (req, res) => {
  try {
    const { name, email, title, imageUrl } = req.body;
    const { rows } = await pool.query(
      'INSERT INTO booking_specialists (name, email, title, image_url) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, title, imageUrl]
    );
    res.json({ success: true, specialist: rows[0] });
  } catch (error) {
    console.error('Error creating specialist:', error);
    res.status(500).json({ success: false, message: 'Failed to create specialist' });
  }
});

app.delete('/api/specialists/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM booking_specialists WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'Specialist deleted' });
  } catch (error) {
    console.error('Error deleting specialist:', error);
    res.status(500).json({ success: false, message: 'Failed to delete specialist' });
  }
});

// ==================== SERVICE ENDPOINTS ====================

app.get('/api/booking-services', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM booking_services ORDER BY category, name ASC');
    res.json({ success: true, services: rows });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch services' });
  }
});

// Get unique categories
app.get('/api/booking-categories', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT DISTINCT category FROM booking_services WHERE category IS NOT NULL ORDER BY category ASC');
    res.json({ success: true, categories: rows.map(r => r.category) });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false });
  }
});

app.post('/api/booking-services', async (req, res) => {
  try {
    const { name, duration, price, icon, category, base_fare, per_km_rate } = req.body || {};
    
    const query = 'INSERT INTO booking_services (name, duration, price, icon, category, base_fare, per_km_rate) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *';
    const values = [
      String(name || 'Unnamed Service'),
      String(duration || '30m'),
      String(price || 'PHP 0.00'),
      String(icon || 'ðŸš—'),
      String(category || 'Transport'),
      parseFloat(String(base_fare).replace(/[^0-9.]/g, '')) || 0,
      parseFloat(String(per_km_rate).replace(/[^0-9.]/g, '')) || 0
    ];

    const { rows } = await pool.query(query, values);
    res.json({ success: true, service: rows[0] });
  } catch (error) {
    console.error('ERROR SAVING SERVICE:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update a clinical service
app.put('/api/booking-services/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, duration, price, icon, category, base_fare, per_km_rate } = req.body;
    
    const query = `
      UPDATE booking_services 
      SET name = $1, duration = $2, price = $3, icon = $4, category = $5, base_fare = $6, per_km_rate = $7, updated_at = CURRENT_TIMESTAMP
      WHERE id = $8 RETURNING *`;
    const values = [name, duration, price, icon, category, base_fare, per_km_rate, id];
    
    const { rows } = await pool.query(query, values);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    res.json({ success: true, service: rows[0] });
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete a clinical service
app.delete('/api/booking-services/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`[Admin] Deleting service ID: ${id}`);
    await pool.query('DELETE FROM booking_services WHERE id = $1', [id]);
    res.json({ success: true, message: 'Service deleted' });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== RIDER TRACKING ENDPOINTS ====================

// Standard rider login (by username/password)
app.post('/api/rider/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log(`[Rider Login] Attempt for: ${username}`);
    const { rows } = await pool.query('SELECT * FROM riders WHERE username = $1 AND password = $2', [username, password]);
    
    if (rows.length === 0) {
      console.log(`[Rider Login] FAILED for: ${username}`);
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }
    
    console.log(`[Rider Login] SUCCESS for: ${username}`);
    res.json({ success: true, rider: rows[0] });
  } catch (error) {
    console.error('[Rider Login] Error:', error);
    res.status(500).json({ success: false });
  }
});

// Get pending transport requests
app.get('/api/rider/requests', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT a.*, s.base_fare, s.per_km_rate 
      FROM appointments a
      JOIN booking_services s ON a.service_type = s.name
      WHERE s.category ILIKE 'TRANSPORT' 
      AND a.transport_status = 'unassigned'
      AND a.status NOT IN ('cancelled', 'completed')
      ORDER BY a.created_at DESC
    `);
    res.json({ success: true, requests: rows });
  } catch (error) {
    console.error('Error fetching rider requests:', error);
    res.status(500).json({ success: false });
  }
});

// Accept a request
app.post('/api/rider/accept', async (req, res) => {
  try {
    const { appointmentId, riderId } = req.body;
    await pool.query(
      "UPDATE appointments SET rider_id = $1, transport_status = 'accepted', status = 'confirmed' WHERE id = $2",
      [riderId, appointmentId]
    );
    res.json({ success: true, message: 'Request accepted' });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

// Update rider location
app.post('/api/rider/update-location', async (req, res) => {
  try {
    const { riderId, lat, lng } = req.body;
    await pool.query(
      'UPDATE riders SET current_lat = $1, current_lng = $2, last_updated = NOW(), status = $3 WHERE id = $4',
      [lat, lng, 'online', riderId]
    );

    // Broadcast location update to all connected admins/staff
    wsBroadcast({ 
      type: 'location_update', 
      riderId, 
      lat, 
      lng,
      timestamp: new Date()
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

// Update trip status
app.post('/api/rider/update-status', async (req, res) => {
  try {
    const { appointmentId, status } = req.body; // on_way_to_pickup, arrived_at_pickup, picked_up, completed
    
    let aptStatus = 'confirmed';
    if (status === 'completed') aptStatus = 'completed';

    await pool.query(
      'UPDATE appointments SET transport_status = $1, status = $2, updated_at = NOW() WHERE id = $3',
      [status, aptStatus, appointmentId]
    );

    // Broadcast status update to all connected admins/staff
    wsBroadcast({ 
      type: 'trip_update', 
      appointmentId, 
      status,
      timestamp: new Date()
    });

    res.json({ success: true, transport_status: status });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

// ==================== ADMIN RIDER MANAGEMENT ENDPOINTS ====================

// Get all riders (admin)
app.get('/api/admin/riders', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM riders ORDER BY name ASC');
    res.json({ success: true, riders: rows });
  } catch (error) {
    console.error('Error fetching riders:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch riders' });
  }
});

// Add new rider (admin)
app.post('/api/admin/riders', async (req, res) => {
  try {
    const { name, username, password, email, phone, address, vehicle_type, plate_number, brand_model } = req.body;
    const { rows } = await pool.query(
      'INSERT INTO riders (name, username, password, email, phone, address, vehicle_type, plate_number, brand_model, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
      [name, username, password, email, phone, address, vehicle_type, plate_number, brand_model, 'offline']
    );
    res.json({ success: true, rider: rows[0] });
  } catch (error) {
    console.error('Error creating rider:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update rider (admin)
app.put('/api/admin/riders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, vehicle_type, plate_number, brand_model, status } = req.body;
    const { rows } = await pool.query(
      'UPDATE riders SET name = $1, email = $2, phone = $3, address = $4, vehicle_type = $5, plate_number = $6, brand_model = $7, status = $8, last_updated = NOW() WHERE id = $9 RETURNING *',
      [name, email, phone, address, vehicle_type, plate_number, brand_model, status, id]
    );
    res.json({ success: true, rider: rows[0] });
  } catch (error) {
    console.error('Error updating rider:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete rider (admin)
app.delete('/api/admin/riders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM riders WHERE id = $1', [id]);
    res.json({ success: true, message: 'Rider removed' });
  } catch (error) {
    console.error('Error deleting rider:', error);
    res.status(500).json({ success: false, message: 'Failed to delete rider' });
  }
});

// Get rider trip history
app.get('/api/admin/riders/:id/trips', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      "SELECT * FROM appointments WHERE rider_id = $1 ORDER BY created_at DESC",
      [id]
    );
    res.json({ success: true, trips: rows });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

// ==================== TRIP MONITORING ENDPOINTS ====================

// Get all trips (admin monitoring)
app.get('/api/admin/trips', async (req, res) => {
  try {
    const { status, date } = req.query;
    // We assume any appointment with pickup_lat is a transport trip
    let query = `
      SELECT a.*, r.name as rider_name, r.plate_number, r.vehicle_type, r.current_lat as rider_lat, r.current_lng as rider_lng
      FROM appointments a
      LEFT JOIN riders r ON a.rider_id = r.id
      JOIN booking_services s ON a.service_type = s.name
      WHERE s.category ILIKE 'TRANSPORT'
    `;
    const params = [];

    if (status && status !== 'all') {
      params.push(status);
      query += ` AND a.transport_status = $${params.length}`;
    }

    query += ' ORDER BY a.created_at DESC';
    const { rows } = await pool.query(query, params);
    res.json({ success: true, trips: rows });
  } catch (error) {
    console.error('Fetch trips error:', error);
    res.status(500).json({ success: false });
  }
});

// Trip summary stats
app.get('/api/admin/trips/stats', async (req, res) => {
  try {
    const statsQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE a.transport_status = 'picked_up' OR a.transport_status = 'en_route') as ongoing,
        COUNT(*) FILTER (WHERE a.transport_status = 'completed') as completed,
        COUNT(*) FILTER (WHERE a.transport_status = 'cancelled') as cancelled,
        COUNT(*) FILTER (WHERE a.transport_status = 'sos') as sos
      FROM appointments a
      JOIN booking_services s ON a.service_type = s.name
      WHERE s.category ILIKE 'TRANSPORT'
    `;
    const { rows } = await pool.query(statsQuery);
    res.json({ success: true, stats: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

// Get trip incidents (SOS)
app.get('/api/admin/incidents', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT i.*, a.full_name as passenger_name, r.name as rider_name, r.phone as rider_phone
      FROM trip_incidents i
      JOIN appointments a ON i.trip_id = a.id
      JOIN riders r ON i.rider_id = r.id
      ORDER BY i.created_at DESC
    `);
    res.json({ success: true, incidents: rows });
  } catch (error) {
    console.error('Fetch incidents error:', error);
    res.status(500).json({ success: false });
  }
});

// Add timeline entry (internal helper call)
app.post('/api/admin/trips/:id/timeline', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await pool.query('INSERT INTO trip_timeline (trip_id, status) VALUES ($1, $2)', [id, status]);
    await pool.query('UPDATE appointments SET transport_status = $1 WHERE id = $2', [status, id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

// ==================== PATIENT TRACKING ENDPOINTS ====================

// Lookup appointment by email and reference ID
app.post('/api/patient/lookup', async (req, res) => {
  try {
    const { email, referenceId } = req.body;
    const { rows } = await pool.query(
      'SELECT * FROM appointments WHERE email = $1 AND id = $2',
      [email, referenceId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'No appointment found with these details.' });
    }

    res.json({ success: true, appointment: rows[0] });
  } catch (error) {
    console.error('Lookup error:', error);
    res.status(500).json({ success: false, message: 'An error occurred during lookup.' });
  }
});

// Real-time tracker for clients
app.get('/api/patient/appointment/:token/tracker', async (req, res) => {
  try {
    const { token } = req.params;
    const { rows } = await pool.query(`
      SELECT a.*, r.name as rider_name, r.phone as rider_phone, 
             r.vehicle_type, r.plate_number,
             r.current_lat, r.current_lng, r.last_updated as rider_last_ping
      FROM appointments a
      LEFT JOIN riders r ON a.rider_id = r.id
      WHERE a.cancel_token = $1
    `, [token]);

    if (rows.length === 0) return res.status(404).json({ success: false });
    res.json({ success: true, tracking: rows[0] });
  } catch (error) {
    console.error('Tracker error:', error);
    res.status(500).json({ success: false });
  }
});

// ==================== CLINIC SETTINGS ENDPOINTS ====================

app.get('/api/clinic-settings', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT key, value FROM clinic_settings');
    const settings = {};
    rows.forEach(r => { settings[r.key] = r.value; });
    res.json({ success: true, settings });
  } catch (error) {
    console.error('Error fetching clinic settings:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch settings' });
  }
});

app.post('/api/clinic-settings', async (req, res) => {
  try {
    const { settings } = req.body;
    for (const [key, value] of Object.entries(settings)) {
      await pool.query(
        `INSERT INTO clinic_settings (key, value) VALUES ($1, $2)
         ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
        [key, value]
      );
    }
    await loadSettings();
    res.json({ success: true, message: 'Settings saved.' });
  } catch (error) {
    console.error('Error saving clinic settings:', error);
    res.status(500).json({ success: false, message: 'Failed to save settings' });
  }
});

// Create clinic_settings table and seed defaults on startup
const initClinicSettings = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS clinic_settings (
      key VARCHAR(100) PRIMARY KEY,
      value TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS booking_specialists (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255),
      title VARCHAR(255),
      image_url TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS booking_services (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      duration VARCHAR(50),
      price VARCHAR(50),
      icon TEXT,
      category VARCHAR(100),
      base_fare DECIMAL(10, 2) DEFAULT 0,
      per_km_rate DECIMAL(10, 2) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Migration for existing table
  await pool.query(`ALTER TABLE booking_services ADD COLUMN IF NOT EXISTS base_fare DECIMAL(10, 2) DEFAULT 0`);
  await pool.query(`ALTER TABLE booking_services ADD COLUMN IF NOT EXISTS per_km_rate DECIMAL(10, 2) DEFAULT 0`);
  await pool.query(`ALTER TABLE booking_services ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);

  // Rider Tracking Table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS riders (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100),
      username VARCHAR(50) UNIQUE,
      password VARCHAR(100),
      email VARCHAR(100),
      phone VARCHAR(20),
      address TEXT,
      status VARCHAR(20) DEFAULT 'offline',
      current_lat DECIMAL(10, 8),
      current_lng DECIMAL(11, 8),
      vehicle_type VARCHAR(50),
      plate_number VARCHAR(20),
      brand_model VARCHAR(100),
      last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Migration for additional rider fields
  await pool.query(`ALTER TABLE riders ADD COLUMN IF NOT EXISTS email VARCHAR(100)`);
  await pool.query(`ALTER TABLE riders ADD COLUMN IF NOT EXISTS address TEXT`);
  await pool.query(`ALTER TABLE riders ADD COLUMN IF NOT EXISTS brand_model VARCHAR(100)`);
  await pool.query(`ALTER TABLE riders ADD COLUMN IF NOT EXISTS vehicle_type VARCHAR(50)`);
  await pool.query(`ALTER TABLE riders ADD COLUMN IF NOT EXISTS plate_number VARCHAR(20)`);
  
  // Migration for appointments tracking
  await pool.query(`ALTER TABLE appointments ADD COLUMN IF NOT EXISTS rider_id INTEGER`);
  await pool.query(`ALTER TABLE appointments ADD COLUMN IF NOT EXISTS transport_status VARCHAR(50) DEFAULT 'unassigned'`);
  await pool.query(`ALTER TABLE appointments ADD COLUMN IF NOT EXISTS pickup_lat DECIMAL(10, 8)`);
  await pool.query(`ALTER TABLE appointments ADD COLUMN IF NOT EXISTS pickup_lng DECIMAL(11, 8)`);
  await pool.query(`ALTER TABLE appointments ADD COLUMN IF NOT EXISTS dest_lat DECIMAL(10, 8)`);
  await pool.query(`ALTER TABLE appointments ADD COLUMN IF NOT EXISTS dest_lng DECIMAL(11, 8)`);
  await pool.query(`ALTER TABLE appointments ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10, 2) DEFAULT 0`);
  
  // Trip Incidents / SOS tracking
  await pool.query(`
    CREATE TABLE IF NOT EXISTS trip_incidents (
      id SERIAL PRIMARY KEY,
      trip_id INTEGER,
      rider_id INTEGER,
      type VARCHAR(50) DEFAULT 'SOS',
      description TEXT,
      lat DECIMAL(10, 8),
      lng DECIMAL(11, 8),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status VARCHAR(20) DEFAULT 'pending'
    )
  `);

  // Trip Timeline tracking
  await pool.query(`
    CREATE TABLE IF NOT EXISTS trip_timeline (
      id SERIAL PRIMARY KEY,
      trip_id INTEGER,
      status VARCHAR(50),
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Seed a demo rider if none exists
  const rCheck = await pool.query('SELECT COUNT(*) FROM riders');
  if (parseInt(rCheck.rows[0].count) === 0) {
    await pool.query(`
      INSERT INTO riders (name, username, password, phone, status, vehicle_type, plate_number) 
      VALUES ('Demo Rider', 'rider1', 'rider123', '09123456789', 'online', 'Luxury White Van', 'KNG-1234')
    `);
  }

  // Seed Transport Services if they don't exist
  const sCheck = await pool.query("SELECT COUNT(*) FROM booking_services WHERE category ILIKE 'TRANSPORT'");
  if (parseInt(sCheck.rows[0].count) === 0) {
    await pool.query(`
      INSERT INTO booking_services (name, category, duration, price, base_fare, per_km_rate) VALUES
      ('Standard', 'TRANSPORT', 'Flexible', 'Varies', 50.00, 15.00),
      ('Car', 'TRANSPORT', 'Flexible', 'Varies', 100.00, 25.00),
      ('Luxury Van', 'TRANSPORT', 'Flexible', 'Varies', 250.00, 45.00)
    `);
  }

  // Migrate appointments table
  try {
    await pool.query('ALTER TABLE appointments ADD COLUMN IF NOT EXISTS specialist_id INTEGER REFERENCES booking_specialists(id)');
    await pool.query('ALTER TABLE appointments ADD COLUMN IF NOT EXISTS agent_code VARCHAR(50)');
    await pool.query('ALTER TABLE appointments ADD COLUMN IF NOT EXISTS pickup_location TEXT');
    await pool.query('ALTER TABLE appointments ADD COLUMN IF NOT EXISTS destination_location TEXT');
    
    // Performance indexes
    await pool.query('CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(preferred_date)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_queue_date ON queue_tickets(queue_date)');
  } catch (e) {}

  const defaults = [
    ['clinic_name',                'HealthCare Clinic'],
    ['clinic_address',             'Cantecson, Gairan, Bogo City, Cebu'],
    ['clinic_phone',               '+63 912 345 6789'],
    ['sms_confirmation',           'Hi {name}, your appointment at {clinic_name} is confirmed for {date} at {time}. Ref#{ref}'],
    ['sms_reminder',               'Hi {name}, reminder: Your appointment at {clinic_name} is on {date} at {time}. Ref#{ref}'],
    ['email_confirmation_subject', 'Appointment Confirmation - {clinic_name}'],
    ['email_cancellation_subject', 'Appointment Cancelled - {clinic_name}'],
    ['email_reschedule_subject',   'Appointment Rescheduled - {clinic_name}'],
    ['email_reminder_subject',     'Appointment Reminder - Tomorrow at {clinic_name}'],
    ['email_confirmation_body',    DEFAULT_CONFIRMATION_HTML],
    ['email_cancellation_body',    DEFAULT_CANCELLATION_HTML],
    ['email_reschedule_body',      DEFAULT_RESCHEDULE_HTML],
    ['email_reminder_body',        DEFAULT_REMINDER_HTML],
  ];
  for (const [key, value] of defaults) {
    await pool.query(
      `INSERT INTO clinic_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING`,
      [key, value]
    );
  }
};

// Auto-queue: forward appointments to the queue 10 minutes before their scheduled time
const autoQueueAppointments = async () => {
  try {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0]; // 'YYYY-MM-DD'
    const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();

    // Fetch today's pending/confirmed appointments
    const { rows: appointments } = await pool.query(
      `SELECT * FROM appointments WHERE preferred_date = $1 AND status IN ('pending', 'confirmed')`,
      [todayStr]
    );

    for (const appt of appointments) {
      // Parse "9:00 AM" -> total minutes since midnight
      const [timePart, period] = appt.preferred_time.split(' ');
      let [h, m] = timePart.split(':').map(Number);
      if (period === 'PM' && h !== 12) h += 12;
      if (period === 'AM' && h === 12) h = 0;
      const apptTotalMinutes = h * 60 + (m || 0);

      // Trigger 10 minutes before the appointment time
      if (currentTotalMinutes >= apptTotalMinutes - 10) {
        // Get prefix for transaction type (case-insensitive)
        const typeResult = await pool.query(
          `SELECT prefix FROM queue_transaction_types WHERE LOWER(name) = LOWER($1) AND active = true LIMIT 1`,
          [appt.service_type]
        );
        const prefix = typeResult.rows[0]?.prefix || 'GN';

        // Next ticket number for this type today
        const countResult = await pool.query(
          `SELECT COUNT(*) as count FROM queue_tickets WHERE LOWER(transaction_type) = LOWER($1) AND queue_date = CURRENT_DATE`,
          [appt.service_type]
        );
        const nextNum = parseInt(countResult.rows[0].count) + 1;
        const ticketNumber = `${prefix}-${String(nextNum).padStart(3, '0')}`;

        // Insert queue ticket
        await pool.query(
          `INSERT INTO queue_tickets (ticket_number, customer_name, cellphone_number, transaction_type, status, queue_date)
           VALUES ($1, $2, $3, $4, 'waiting', CURRENT_DATE)`,
          [ticketNumber, appt.full_name, appt.phone_number, appt.service_type]
        );

        // Mark appointment as queued to prevent re-processing
        await pool.query(
          `UPDATE appointments SET status = 'queued', updated_at = NOW() WHERE id = $1`,
          [appt.id]
        );

        console.log(`[Auto-Queue] ${appt.full_name} -> ticket ${ticketNumber} (appt #${appt.id})`);
      }
    }
  } catch (err) {
    console.error('[Auto-Queue] Error:', err.message);
  }
};

// Run every 60 seconds
setInterval(autoQueueAppointments, 60 * 1000);
// Run once 3 seconds after server starts to catch already-due appointments
setTimeout(autoQueueAppointments, 3000);

// Initialize clinic settings table + seed defaults, then start server
initClinicSettings()
  .then(() => loadSettings())
  .then(() => {
    console.log('Clinic settings loaded.');
    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Settings init error:', err);
    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  });
