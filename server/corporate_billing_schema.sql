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
