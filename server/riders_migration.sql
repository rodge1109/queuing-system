
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
