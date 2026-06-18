-- CONSOLIDATED SCHEMA FOR SUPABASE

-- File: schema.sql
-- Create the appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    service_type VARCHAR(100) NOT NULL,
    preferred_date DATE NOT NULL,
    preferred_time VARCHAR(20) NOT NULL,
    notes TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create an index for faster queries
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(preferred_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);


-- File: transport_migration.sql

-- Migration script to add transport-related columns to appointments table
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS cancel_token VARCHAR(255);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS specialist_id INTEGER;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS agent_code VARCHAR(50);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS pickup_location TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS destination_location TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS pickup_lat DECIMAL(10, 8);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS pickup_lng DECIMAL(11, 8);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS dest_lat DECIMAL(10, 8);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS dest_lng DECIMAL(11, 8);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS transport_status VARCHAR(50) DEFAULT 'searching';
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS rider_id INTEGER;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_appointments_token ON appointments(cancel_token);
CREATE INDEX IF NOT EXISTS idx_appointments_transport_status ON appointments(transport_status);


-- File: riders_migration.sql

-- Migration to add riders table
CREATE TABLE IF NOT EXISTS riders (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    vehicle_type VARCHAR(50),
    plate_number VARCHAR(20),
    is_online BOOLEAN DEFAULT false,
    current_lat DECIMAL(10, 8),
    current_lng DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample rider
INSERT INTO riders (username, password, name, vehicle_type, plate_number)
VALUES ('rider1', '$2b$10$y6mUuN.v.8u8.v8u8.v8u8.v8u8.v8u8.v8u8.v8u8.v8u8.v8u8', 'Juan Rider', 'Motorcycle', 'ABC 1234')
ON CONFLICT (username) DO NOTHING;


-- File: queue_schema.sql
-- Queue System Schema

-- Transaction Types
CREATE TABLE IF NOT EXISTS queue_transaction_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  prefix VARCHAR(3) NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Teller Windows
CREATE TABLE IF NOT EXISTS queue_tellers (
  id SERIAL PRIMARY KEY,
  window_name VARCHAR(50) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Queue Tickets
CREATE TABLE IF NOT EXISTS queue_tickets (
  id SERIAL PRIMARY KEY,
  ticket_number VARCHAR(20) NOT NULL,
  customer_name VARCHAR(100) NOT NULL,
  cellphone_number VARCHAR(20) NOT NULL,
  transaction_type VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'waiting',
  teller_window VARCHAR(50),
  queue_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  called_at TIMESTAMP,
  completed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_queue_tickets_date ON queue_tickets(queue_date);
CREATE INDEX IF NOT EXISTS idx_queue_tickets_status ON queue_tickets(status);

-- Window-Transaction Assignments (many-to-many)
CREATE TABLE IF NOT EXISTS queue_window_transactions (
  id SERIAL PRIMARY KEY,
  teller_id INTEGER REFERENCES queue_tellers(id) ON DELETE CASCADE,
  transaction_type_id INTEGER REFERENCES queue_transaction_types(id) ON DELETE CASCADE,
  UNIQUE(teller_id, transaction_type_id)
);

-- Seed default transaction types
INSERT INTO queue_transaction_types (name, prefix) VALUES
  ('Business Permit', 'BP'),
  ('Payment', 'PY'),
  ('Inquiry', 'IQ')
ON CONFLICT DO NOTHING;

-- Seed default teller windows
INSERT INTO queue_tellers (window_name) VALUES
  ('Window 1'),
  ('Window 2')
ON CONFLICT DO NOTHING;


-- File: corporate_billing_schema.sql
-- Corporate Accounts
CREATE TABLE IF NOT EXISTS corporate_accounts (
    id SERIAL PRIMARY KEY,
    account_number VARCHAR(100) UNIQUE NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    credit_limit DECIMAL(12, 2) DEFAULT 0,
    balance DECIMAL(12, 2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Corporate Ledgers
CREATE TABLE IF NOT EXISTS corporate_ledgers (
    id SERIAL PRIMARY KEY,
    account_id INTEGER REFERENCES corporate_accounts(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    reference VARCHAR(100) NOT NULL,
    description TEXT,
    debit DECIMAL(12, 2) DEFAULT 0,
    credit DECIMAL(12, 2) DEFAULT 0,
    balance DECIMAL(12, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Corporate Invoices
CREATE TABLE IF NOT EXISTS corporate_invoices (
    id SERIAL PRIMARY KEY,
    account_id INTEGER REFERENCES corporate_accounts(id) ON DELETE CASCADE,
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    period_start DATE,
    period_end DATE,
    amount DECIMAL(12, 2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending',
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Corporate Payments
CREATE TABLE IF NOT EXISTS corporate_payments (
    id SERIAL PRIMARY KEY,
    account_id INTEGER REFERENCES corporate_accounts(id) ON DELETE CASCADE,
    invoice_id INTEGER REFERENCES corporate_invoices(id) ON DELETE SET NULL,
    amount DECIMAL(12, 2) NOT NULL,
    method VARCHAR(100) NOT NULL,
    payment_date DATE NOT NULL,
    reference_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Update Appointments table
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'Cash';
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS corporate_account_id INTEGER REFERENCES corporate_accounts(id) ON DELETE SET NULL;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS billing_status VARCHAR(50) DEFAULT 'unbilled';


-- File: survey_schema.sql
CREATE TABLE IF NOT EXISTS survey (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    age INTEGER,
    sex VARCHAR(10),
    region VARCHAR(100),
    contact_number VARCHAR(50),
    service_availed VARCHAR(200),
    client_type VARCHAR(100),
    cc1 VARCHAR(150),
    cc2 VARCHAR(150),
    cc3 VARCHAR(150),
    cc3_reason TEXT,
    sqd0 INTEGER,
    sqd1 INTEGER,
    sqd2 INTEGER,
    sqd3 INTEGER,
    sqd4 INTEGER,
    sqd5 INTEGER,
    sqd6 INTEGER,
    sqd7 INTEGER,
    sqd8 INTEGER,
    suggestions TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- File: database_updates.sql
-- Database Updates for Clinic Booking System Advanced Features
-- Run these SQL commands in your PostgreSQL database

-- 1. Update appointments table with new columns (if not already added)
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT false;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS cancel_token VARCHAR(100);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS doctor_id INTEGER;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS sms_sent BOOLEAN DEFAULT false;

-- 2. Blocked Dates / Holidays table
CREATE TABLE IF NOT EXISTS blocked_dates (
    id SERIAL PRIMARY KEY,
    blocked_date DATE NOT NULL UNIQUE,
    reason VARCHAR(255) DEFAULT 'Holiday/Clinic Closed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Doctors table
CREATE TABLE IF NOT EXISTS doctors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    specialization VARCHAR(255) DEFAULT 'General Practice',
    color VARCHAR(20) DEFAULT '#3B82F6',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Services table with duration
CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    duration INTEGER DEFAULT 30,  -- duration in minutes
    price DECIMAL(10, 2) DEFAULT 0,
    description TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Add foreign key for doctor_id (optional, if you want referential integrity)
-- ALTER TABLE appointments ADD CONSTRAINT fk_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id);

-- Sample data for testing

-- Add some sample blocked dates
INSERT INTO blocked_dates (blocked_date, reason) VALUES
    ('2025-12-25', 'Christmas Day'),
    ('2025-12-31', 'New Year''s Eve'),
    ('2025-01-01', 'New Year''s Day')
ON CONFLICT (blocked_date) DO NOTHING;

-- Add some sample doctors
INSERT INTO doctors (name, specialization, color) VALUES
    ('Dr. Juan Dela Cruz', 'General Practice', '#3B82F6'),
    ('Dr. Maria Santos', 'Pediatrics', '#10B981'),
    ('Dr. Pedro Reyes', 'Internal Medicine', '#8B5CF6')
ON CONFLICT DO NOTHING;

-- Add some sample services
INSERT INTO services (name, duration, price, description) VALUES
    ('General Consultation', 30, 500, 'General health checkup and consultation'),
    ('Dental Cleaning', 45, 800, 'Professional teeth cleaning'),
    ('Eye Examination', 30, 600, 'Comprehensive eye exam'),
    ('Vaccination', 15, 350, 'Immunization shots'),
    ('Laboratory Tests', 60, 1200, 'Blood work and other lab tests'),
    ('Physical Therapy', 60, 1000, 'Rehabilitation therapy session')
ON CONFLICT DO NOTHING;

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_blocked_dates_date ON blocked_dates(blocked_date);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(preferred_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);


