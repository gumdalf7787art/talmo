-- hospital_schema.sql
-- Create clinics table for storing hospital settings
CREATE TABLE IF NOT EXISTS clinics (
    id TEXT PRIMARY KEY, -- matches users.id
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    detail_description TEXT,
    address TEXT,
    contact TEXT,
    image_url TEXT,
    consults INTEGER DEFAULT 0,
    reviews INTEGER DEFAULT 0,
    is_premium BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
