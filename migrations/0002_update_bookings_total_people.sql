-- Migration number: 0002        2025-04-09
-- Update bookings.total_people from TEXT to INTEGER

-- Create a temporary table with the correct schema
CREATE TABLE bookings_temp (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  package_id INTEGER,
  total_people INTEGER NOT NULL, -- Changed from TEXT to INTEGER
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  total_amount REAL NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  payment_details TEXT,
  special_requests TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (package_id) REFERENCES packages(id)
);

-- Copy data from the original table to the temporary table, converting total_people to INTEGER
INSERT INTO bookings_temp (id, user_id, package_id, total_people, start_date, end_date, status, total_amount, payment_status, payment_details, special_requests, created_at, updated_at)
SELECT id, user_id, package_id, CAST(total_people AS INTEGER), start_date, end_date, status, total_amount, payment_status, payment_details, special_requests, created_at, updated_at
FROM bookings;

-- Drop the original table
DROP TABLE bookings;

-- Rename the temporary table to the original name
ALTER TABLE bookings_temp RENAME TO bookings;

-- Recreate indexes
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_package_id ON bookings(package_id);
CREATE INDEX idx_bookings_status ON bookings(status);
