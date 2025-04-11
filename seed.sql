-- seed.sql - Seed data for Andaman Travel Platform


-- seed.sql

-- Clear existing data (Uncomment lines below to reset tables)
DELETE FROM booking_services;
DELETE FROM bookings;
DELETE FROM reviews;
DELETE FROM packages;
DELETE FROM services; -- Delete services BEFORE providers
DELETE FROM service_providers; -- Delete providers BEFORE users
DELETE FROM ferry_schedules;
DELETE FROM ferries;
DELETE FROM permits;
DELETE FROM islands;
DELETE FROM users WHERE email NOT LIKE 'admin@%'; -- Keep admin user (ID 1)

PRAGMA foreign_keys=OFF; -- Temporarily disable FK checks during seeding

-- ... (Rest of your INSERT statements) ...



-- =============================================
-- Roles (Already seeded by migration 0001, but included for completeness if needed)
-- =============================================
-- INSERT OR IGNORE INTO roles (id, name, description, permissions) VALUES
--   (1, 'admin', 'Administrator with full access', 'all'),
--   (2, 'user', 'Regular user/traveler', 'basic'),
--   (3, 'vendor', 'Service provider/vendor', 'vendor');

-- =============================================
-- Users (Admin seeded by migration 0001)
-- Note: Passwords here use a placeholder hash for 'password'.
-- Replace 'placeholder_bcrypt_hash_for_password' with a real hash if needed for login testing,
-- or update them after creation via an API or direct DB command.
-- A common hash for 'password' (cost 10) is: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
-- =============================================
INSERT INTO users (id, email, password_hash, first_name, last_name, phone, role_id) VALUES
  (2, 'testuser@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Test', 'User', '9876543210', 2),
  (3, 'scubavendor@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Scuba', 'Vendor', '9876543211', 3),
  (4, 'hotelvendor@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Hotel', 'Manager', '9876543212', 3);

-- =============================================
-- Islands
-- =============================================
INSERT INTO islands (id, name, description, permit_required, images) VALUES
  (1, 'Port Blair', 'The capital city and entry point to the Andaman Islands, known for its historical significance and cellular jail.', 0, '/images/port_blair.jpg'),
  (2, 'Havelock Island (Swaraj Dweep)', 'Famous for its stunning beaches like Radhanagar Beach (Beach No. 7) and clear waters ideal for water sports.', 0, '/images/havelock.jpg'),
  (3, 'Neil Island (Shaheed Dweep)', 'A smaller, quieter island known for its relaxed vibe, natural bridge formations, and beautiful beaches like Laxmanpur and Bharatpur.', 0, '/images/neil.jpg'),
  (4, 'Baratang Island', 'Known for its unique mangrove creeks, limestone caves, and mud volcanoes. Requires permits.', 1, '/images/baratang.jpg');

-- =============================================
-- Service Providers (Link users with role 'vendor' to businesses)
-- Assume user IDs: 3=scubavendor, 4=hotelvendor
-- =============================================
INSERT INTO service_providers (id, user_id, business_name, type, address, verified, bank_details) VALUES
  (1, 3, 'Andaman Scuba Experts', 'activity_provider', 'Beach No. 3, Havelock Island', 1, '{"account_no": "123", "ifsc": "ABC"}'),
  (2, 4, 'SeaShell Port Blair', 'accommodation', 'Marine Hill, Port Blair', 1, '{"account_no": "456", "ifsc": "DEF"}'),
  (3, 3, 'Havelock Snorkeling Tours', 'activity_provider', 'Jetty Area, Havelock Island', 1, '{"account_no": "789", "ifsc": "GHI"}'); -- Same vendor, different service type focus

-- =============================================
-- Services (Link providers to specific offerings on islands)
-- Assume Provider IDs: 1=Scuba Experts, 2=SeaShell, 3=Snorkeling Tours
-- Assume Island IDs: 1=Port Blair, 2=Havelock, 3=Neil
-- =============================================
INSERT INTO services (id, name, description, type, provider_id, island_id, price, images, availability, amenities) VALUES
  (1, 'Beginner Scuba Dive (Shore Dive)', 'Experience the underwater world near Havelock shore. Includes basic training and guide.', 'activity', 1, 2, '3500', '/images/scuba.jpg', 'Daily 9am, 1pm', 'Equipment, Instructor'),
  (2, 'Snorkeling Trip to Elephant Beach', 'Boat trip to Elephant Beach with snorkeling gear provided. See vibrant corals.', 'activity', 3, 2, '1500', '/images/snorkeling.jpg', 'Daily 10am', 'Boat, Snorkel Gear, Guide'),
  (3, 'Standard Room - SeaShell PB', 'Comfortable AC room with essential amenities in Port Blair.', 'accommodation', 2, 1, '5500', '/images/seashell_room.jpg', 'Year-round', 'AC, WiFi, TV, Restaurant'),
  (4, 'Advanced Open Water Course', 'PADI certified course for experienced divers.', 'activity', 1, 2, '18000', '/images/scuba-advanced.jpg', 'On Request', 'Equipment, Certification, Instructor'),
  (5, 'Glass Bottom Boat Ride', 'View corals and fish without getting wet at Bharatpur Beach.', 'activity', 3, 3, '1200', '/images/glass-boat.jpg', 'Daily 11am, 2pm', 'Boat, Guide'); -- Added service on Neil Island

-- =============================================
-- Packages (Combine islands/services into bookable trips)
-- created_by uses Admin User ID (1)
-- included_services can be descriptive text or JSON array of service IDs
-- =============================================
INSERT INTO packages (id, name, description, duration, base_price, max_people, created_by, is_active, itinerary, included_services, images) VALUES
  (1, 'Havelock Beach Bliss', 'Relax on Radhanagar Beach and enjoy basic water activities in Havelock.', '4 Days / 3 Nights', 15999, 4, 1, 1,
    '{
  "highlights": ["Radhanagar Beach", "Clear Water"],
  "inclusions": ["AC Hotel", "Breakfast", "Ferry"],
  "exclusions": ["Flights", "Lunch"],
  "days": [
    {"day": 1, "title": "Arrival & Transfer", "description": "Meet at airport, transfer to ferry, reach Havelock.", "activities": [], "meals": ["Dinner"], "accommodation": "Sample Resort"},
    {"day": 2, "title": "Radhanagar Beach", "description": "Visit the famous beach.", "activities": [{"name": "Beach Visit", "time": "Morning", "duration": "3 hours"}], "meals": ["Breakfast"], "accommodation": "Sample Resort"}
  ]
}',
    '["Accommodation", "Ferry Tickets", "Breakfast"]',
    '/images/havelock.jpg,/images/radhanagar.jpg'
  ),
  (2, 'Andaman Explorer Lite', 'Covering Port Blair basics and a trip to Havelock Island.', '5 Days / 4 Nights', 19500, 6, 1, 1,
    '{
  "highlights": ["Radhanagar Beach", "Clear Water"],
  "inclusions": ["AC Hotel", "Breakfast", "Ferry"],
  "exclusions": ["Flights", "Lunch"],
  "days": [
    {"day": 1, "title": "Arrival & Transfer", "description": "Meet at airport, transfer to ferry, reach Havelock.", "activities": [], "meals": ["Dinner"], "accommodation": "Sample Resort"},
    {"day": 2, "title": "Radhanagar Beach", "description": "Visit the famous beach.", "activities": [{"name": "Beach Visit", "time": "Morning", "duration": "3 hours"}], "meals": ["Breakfast"], "accommodation": "Sample Resort"}
  ]
}',
    '[3, 1]', -- Example using Service IDs: SeaShell Room (3), Beginner Scuba (1) - Adjust based on actual IDs/logic
    '/images/port_blair.jpg,/images/havelock.jpg'
  ),
  (3, 'Neil Island Escape', 'Experience the tranquility of Neil Island with beach visits and relaxation.', '3 Days / 2 Nights', 12000, 2, 1, 1,
    '{
  "highlights": ["Radhanagar Beach", "Clear Water"],
  "inclusions": ["AC Hotel", "Breakfast", "Ferry"],
  "exclusions": ["Flights", "Lunch"],
  "days": [
    {"day": 1, "title": "Arrival & Transfer", "description": "Meet at airport, transfer to ferry, reach Havelock.", "activities": [], "meals": ["Dinner"], "accommodation": "Sample Resort"},
    {"day": 2, "title": "Radhanagar Beach", "description": "Visit the famous beach.", "activities": [{"name": "Beach Visit", "time": "Morning", "duration": "3 hours"}], "meals": ["Breakfast"], "accommodation": "Sample Resort"}
  ]
}',
    '["Accommodation", "Ferry Tickets", "Breakfast"]',
    '/images/neil.jpg,/images/natural_bridge.jpg'
  );


INSERT INTO bookings (user_id, package_id, total_people, start_date, end_date, status, total_amount, payment_status)
VALUES (2, 1, 2, '2025-07-10', '2025-07-15', 'confirmed', 30000, 'paid');
-- Re-enable FK constraints if they were disabled
PRAGMA foreign_keys=ON;

-- End of seed data