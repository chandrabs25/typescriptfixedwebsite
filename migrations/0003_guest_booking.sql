-- Migration number: 0003        YYYY-MM-DD <-- Update Date
-- Add guest booking columns and make user_id nullable

-- Step 1: Create a new temporary table with the desired schema changes
CREATE TABLE bookings_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NULL, -- Changed from NOT NULL to NULL
  package_id INTEGER,
  total_people INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  total_amount REAL NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  payment_details TEXT,
  special_requests TEXT,
  guest_name TEXT,      -- Added for guest bookings
  guest_email TEXT,     -- Added for guest bookings
  guest_phone TEXT,     -- Added for guest bookings
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id), -- Keep FK, but now allows NULL
  FOREIGN KEY (package_id) REFERENCES packages(id)
);

-- Step 2: Copy existing data from the old table to the new table
-- Assuming existing bookings always had a user_id, set guest fields to NULL
INSERT INTO bookings_new (
    id, user_id, package_id, total_people, start_date, end_date,
    status, total_amount, payment_status, payment_details, special_requests,
    guest_name, guest_email, guest_phone, created_at, updated_at
)
SELECT
    id, user_id, package_id, total_people, start_date, end_date,
    status, total_amount, payment_status, payment_details, special_requests,
    NULL, NULL, NULL, -- Set new guest columns to NULL for existing rows
    created_at, updated_at
FROM bookings;

-- Step 3: Drop the original bookings table
DROP TABLE bookings;

-- Step 4: Rename the new table to the original name
ALTER TABLE bookings_new RENAME TO bookings;

-- Step 5: Recreate indexes (important for performance)
-- Note: Indexes involving user_id might behave differently with NULLs, but are still useful
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_package_id ON bookings(package_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_guest_email ON bookings(guest_email); -- Add index for guest email lookup