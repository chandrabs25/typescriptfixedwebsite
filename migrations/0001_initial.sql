-- Migration number: 0001        2025-04-02
-- Initial database schema for Andaman Travel Platform

-- Drop existing tables if they exist
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS service_providers;
DROP TABLE IF EXISTS islands;
DROP TABLE IF EXISTS services;
DROP TABLE IF EXISTS packages;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS booking_services;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS ferries;
DROP TABLE IF EXISTS ferry_schedules;
DROP TABLE IF EXISTS permits;

-- Create tables based on the designed schema

-- Roles table
CREATE TABLE IF NOT EXISTS roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  permissions TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  role_id INTEGER NOT NULL,
  profile_image TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- Service Providers table
CREATE TABLE IF NOT EXISTS service_providers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  business_name TEXT NOT NULL,
  type TEXT NOT NULL,
  license_no TEXT,
  address TEXT,
  verified BOOLEAN DEFAULT FALSE,
  verification_documents TEXT,
  bank_details TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Islands table
CREATE TABLE IF NOT EXISTS islands (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  permit_required BOOLEAN DEFAULT FALSE,
  permit_details TEXT,
  coordinates TEXT,
  attractions TEXT,
  activities TEXT,
  images TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Services table
CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  provider_id INTEGER NOT NULL,
  island_id INTEGER NOT NULL,
  price TEXT NOT NULL,
  availability TEXT,
  images TEXT,
  amenities TEXT,
  cancellation_policy TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (provider_id) REFERENCES service_providers(id),
  FOREIGN KEY (island_id) REFERENCES islands(id)
);

-- Packages table
CREATE TABLE IF NOT EXISTS packages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  duration TEXT NOT NULL,
  base_price REAL NOT NULL,
  max_people INTEGER,
  created_by INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  itinerary TEXT,
  included_services TEXT,
  images TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  package_id INTEGER,
  total_people TEXT NOT NULL,
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

-- Booking Services table
CREATE TABLE IF NOT EXISTS booking_services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id INTEGER NOT NULL,
  service_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price REAL NOT NULL,
  date DATE,
  status TEXT NOT NULL DEFAULT 'confirmed',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id),
  FOREIGN KEY (service_id) REFERENCES services(id)
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  service_id INTEGER NOT NULL,
  rating INTEGER NOT NULL,
  comment TEXT,
  images TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (service_id) REFERENCES services(id)
);

-- Ferries table
CREATE TABLE IF NOT EXISTS ferries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  provider_id INTEGER NOT NULL,
  amenities TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (provider_id) REFERENCES service_providers(id)
);

-- Ferry Schedules table
CREATE TABLE IF NOT EXISTS ferry_schedules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ferry_id INTEGER NOT NULL,
  origin_id INTEGER NOT NULL,
  destination_id INTEGER NOT NULL,
  departure_time DATETIME NOT NULL,
  arrival_time DATETIME NOT NULL,
  availability INTEGER NOT NULL,
  price REAL NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ferry_id) REFERENCES ferries(id),
  FOREIGN KEY (origin_id) REFERENCES islands(id),
  FOREIGN KEY (destination_id) REFERENCES islands(id)
);

-- Permits table
CREATE TABLE IF NOT EXISTS permits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  requirements TEXT,
  process TEXT,
  duration TEXT,
  cost REAL,
  island_id INTEGER NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (island_id) REFERENCES islands(id)
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_service_providers_user_id ON service_providers(user_id);
CREATE INDEX idx_service_providers_type ON service_providers(type);
CREATE INDEX idx_services_provider_id ON services(provider_id);
CREATE INDEX idx_services_island_id ON services(island_id);
CREATE INDEX idx_services_type ON services(type);
CREATE INDEX idx_packages_created_by ON packages(created_by);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_package_id ON bookings(package_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_booking_services_booking_id ON booking_services(booking_id);
CREATE INDEX idx_booking_services_service_id ON booking_services(service_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_service_id ON reviews(service_id);
CREATE INDEX idx_ferry_schedules_ferry_id ON ferry_schedules(ferry_id);
CREATE INDEX idx_ferry_schedules_origin_id ON ferry_schedules(origin_id);
CREATE INDEX idx_ferry_schedules_destination_id ON ferry_schedules(destination_id);
CREATE INDEX idx_permits_island_id ON permits(island_id);

-- Insert initial roles
INSERT INTO roles (name, description, permissions) VALUES 
  ('admin', 'Administrator with full access', 'all'),
  ('user', 'Regular user/traveler', 'basic'),
  ('vendor', 'Service provider/vendor', 'vendor');

-- Insert admin user
INSERT INTO users (email, password_hash, first_name, last_name, role_id) VALUES 
  ('admin@andamantravel.com', 'placeholder_hash_to_be_replaced', 'Admin', 'User', 1);
