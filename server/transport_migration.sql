
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
