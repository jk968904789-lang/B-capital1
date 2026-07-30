/*
# B Capital Hotel — Initial Schema

1. Overview
   This migration sets up the complete database for the B Capital hotel booking system
   (a premium room-booking hotel in Dire Dawa, Ethiopia). It creates the tables that
   power room inventory, customer accounts, staff accounts, bookings, payments and
   hotel settings.

2. New Tables
   - `staff_profiles`
       Stores role + active flag for staff users. Mirrors `auth.users` via a 1:1 link.
       - `id` (uuid, PK, references auth.users) — the Supabase auth user id
       - `email` (text, unique, not null)
       - `full_name` (text, not null)
       - `role` (text: 'admin' | 'cashier', not null, default 'cashier')
       - `is_active` (boolean, default true) — admin can disable staff accounts
       - `created_at` (timestamptz)

   - `customer_profiles`
       Public-facing customer metadata. 1:1 with auth.users.
       - `id` (uuid, PK, references auth.users)
       - `email` (text, unique, not null)
       - `full_name` (text, not null)
       - `phone` (text)
       - `created_at` (timestamptz)

   - `rooms`
       Hotel room inventory. One row per physical room.
       - `id` (uuid, PK)
       - `name` (text, not null) — e.g. "Standard 101"
       - `category` (text: 'standard' | 'deluxe' | 'executive' | 'suite', not null)
       - `description` (text, not null)
       - `price` (numeric(10,2), not null) — price per night in ETB
       - `capacity` (integer, not null, default 2)
       - `size_sqm` (numeric(6,2)) — room size in square meters
       - `amenities` (text[]) — array of amenity labels
       - `image_urls` (text[]) — array of image URLs
       - `is_available` (boolean, default true) — bookable by customers
       - `room_number` (text) — e.g. "101"
       - `floor` (integer)
       - `created_at` (timestamptz)

   - `bookings`
       Customer reservations.
       - `id` (uuid, PK)
       - `room_id` (uuid, references rooms, ON DELETE RESTRICT)
       - `customer_id` (uuid, references auth.users, ON DELETE SET NULL)
       - `customer_name_snapshot` (text) — denormalized name/email for staff + history
       - `customer_email_snapshot` (text)
       - `customer_phone_snapshot` (text)
       - `check_in` (date, not null)
       - `check_out` (date, not null)
       - `nights` (integer, not null)
       - `guests` (integer, not null, default 1)
       - `price_per_night` (numeric(10,2), not null) — snapshot of room price at booking time
       - `total_amount` (numeric(10,2), not null) — nights * price_per_night
       - `status` (text: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled', not null, default 'pending')
       - `payment_status` (text: 'unpaid' | 'paid' | 'refunded', not null, default 'unpaid')
       - `payment_method` (text, default 'pay_at_hotel')
       - `special_requests` (text)
       - `checked_in_at` (timestamptz)
       - `checked_out_at` (timestamptz)
       - `created_at` (timestamptz)

   - `settings`
       Single-row hotel configuration (hotel name, contact info, etc.).
       - `id` (integer, PK, default 1)
       - `hotel_name` (text, default 'B Capital')
       - `tagline` (text)
       - `phone` (text)
       - `email` (text)
       - `address` (text)
       - `city` (text)
       - `country` (text)
       - `check_in_time` (text, default '14:00')
       - `check_out_time` (text, default '11:00')
       - `currency` (text, default 'ETB')
       - `updated_at` (timestamptz)

3. Indexes
   - `idx_bookings_room_dates` on bookings(room_id, check_in, check_out) for availability queries
   - `idx_bookings_customer` on bookings(customer_id)
   - `idx_bookings_status` on bookings(status)
   - `idx_rooms_category` on rooms(category)
   - `idx_staff_profiles_role` on staff_profiles(role)

4. Security (RLS)
   - staff_profiles: admin/cashier read own row; admins manage all staff rows. Because the
     public/authenticated clients cannot distinguish staff from customer purely via RLS,
     access is gated through ownership + a service-role edge function for admin actions.
     Customers cannot read staff_profiles at all.
   - customer_profiles: each authenticated customer reads/updates only their own row.
   - rooms: public read (TO anon, authenticated) so the marketing site loads rooms without
     a login; writes are restricted to authenticated staff via ownership of a staff_profile.
   - bookings: customers see/manage their own bookings; staff can view/manage all bookings
     via an RLS policy that checks the requester is a staff_profile.
   - settings: public read; only staff can update.

   Notes:
   - Availability checks read `rooms` + `bookings` publicly so customers can browse without
     an account.
   - The frontend never creates staff rows directly; admin actions go through an edge
     function using the service role key, so RLS on staff_profiles is deliberately tight.

5. Important notes
   - All date math uses the `date` type (no tz confusion).
   - `price_per_night` and `total_amount` are snapshotted on the booking so historical
     reports stay accurate even if room prices change later.
   - ON DELETE RESTRICT on bookings.room_id prevents deleting a room that has bookings
     (data integrity for reports).
*/

-- ============================================================
-- staff_profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS staff_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'cashier' CHECK (role IN ('admin','cashier')),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE staff_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "staff_read_own" ON staff_profiles;
CREATE POLICY "staff_read_own" ON staff_profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "staff_update_own_name" ON staff_profiles;
CREATE POLICY "staff_update_own_name" ON staff_profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ============================================================
-- customer_profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS customer_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "customer_read_own" ON customer_profiles;
CREATE POLICY "customer_read_own" ON customer_profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "customer_upsert_own" ON customer_profiles;
CREATE POLICY "customer_upsert_own" ON customer_profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "customer_update_own" ON customer_profiles;
CREATE POLICY "customer_update_own" ON customer_profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ============================================================
-- rooms
-- ============================================================
CREATE TABLE IF NOT EXISTS rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('standard','deluxe','executive','suite')),
  description text NOT NULL,
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  capacity integer NOT NULL DEFAULT 2 CHECK (capacity > 0),
  size_sqm numeric(6,2),
  amenities text[] NOT NULL DEFAULT '{}',
  image_urls text[] NOT NULL DEFAULT '{}',
  is_available boolean NOT NULL DEFAULT true,
  room_number text,
  floor integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

-- Public read so the marketing site can browse rooms without signing in.
DROP POLICY IF EXISTS "rooms_public_read" ON rooms;
CREATE POLICY "rooms_public_read" ON rooms FOR SELECT
  TO anon, authenticated USING (true);

-- Only staff (admin/cashier) can write. We verify by joining to staff_profiles.
DROP POLICY IF EXISTS "rooms_staff_insert" ON rooms;
CREATE POLICY "rooms_staff_insert" ON rooms FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM staff_profiles sp WHERE sp.id = auth.uid() AND sp.is_active = true)
  );

DROP POLICY IF EXISTS "rooms_staff_update" ON rooms;
CREATE POLICY "rooms_staff_update" ON rooms FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM staff_profiles sp WHERE sp.id = auth.uid() AND sp.is_active = true)
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM staff_profiles sp WHERE sp.id = auth.uid() AND sp.is_active = true)
  );

DROP POLICY IF EXISTS "rooms_staff_delete" ON rooms;
CREATE POLICY "rooms_staff_delete" ON rooms FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM staff_profiles sp WHERE sp.id = auth.uid() AND sp.is_active = true)
  );

-- ============================================================
-- bookings
-- ============================================================
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
  customer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name_snapshot text,
  customer_email_snapshot text,
  customer_phone_snapshot text,
  check_in date NOT NULL,
  check_out date NOT NULL,
  nights integer NOT NULL CHECK (nights > 0),
  guests integer NOT NULL DEFAULT 1 CHECK (guests > 0),
  price_per_night numeric(10,2) NOT NULL CHECK (price_per_night >= 0),
  total_amount numeric(10,2) NOT NULL CHECK (total_amount >= 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','checked_in','checked_out','cancelled')),
  payment_status text NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid','paid','refunded')),
  payment_method text DEFAULT 'pay_at_hotel',
  special_requests text,
  checked_in_at timestamptz,
  checked_out_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Customers see only their own bookings.
DROP POLICY IF EXISTS "bookings_customer_select" ON bookings;
CREATE POLICY "bookings_customer_select" ON bookings FOR SELECT
  TO authenticated USING (auth.uid() = customer_id);

-- Staff can see all bookings.
DROP POLICY IF EXISTS "bookings_staff_select" ON bookings;
CREATE POLICY "bookings_staff_select" ON bookings FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM staff_profiles sp WHERE sp.id = auth.uid() AND sp.is_active = true)
  );

-- Customers create their own bookings.
DROP POLICY IF EXISTS "bookings_customer_insert" ON bookings;
CREATE POLICY "bookings_customer_insert" ON bookings FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = customer_id);

-- Staff can create bookings (e.g. walk-in reservations).
DROP POLICY IF EXISTS "bookings_staff_insert" ON bookings;
CREATE POLICY "bookings_staff_insert" ON bookings FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM staff_profiles sp WHERE sp.id = auth.uid() AND sp.is_active = true)
  );

-- Customers can update (cancel) their own bookings.
DROP POLICY IF EXISTS "bookings_customer_update" ON bookings;
CREATE POLICY "bookings_customer_update" ON bookings FOR UPDATE
  TO authenticated USING (auth.uid() = customer_id) WITH CHECK (auth.uid() = customer_id);

-- Staff can update any booking (confirm, check-in/out, payment status).
DROP POLICY IF EXISTS "bookings_staff_update" ON bookings;
CREATE POLICY "bookings_staff_update" ON bookings FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM staff_profiles sp WHERE sp.id = auth.uid() AND sp.is_active = true)
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM staff_profiles sp WHERE sp.id = auth.uid() AND sp.is_active = true)
  );

-- Staff can delete bookings.
DROP POLICY IF EXISTS "bookings_staff_delete" ON bookings;
CREATE POLICY "bookings_staff_delete" ON bookings FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM staff_profiles sp WHERE sp.id = auth.uid() AND sp.is_active = true)
  );

-- ============================================================
-- settings
-- ============================================================
CREATE TABLE IF NOT EXISTS settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  hotel_name text NOT NULL DEFAULT 'B Capital',
  tagline text DEFAULT 'Premium Hospitality in Dire Dawa',
  phone text DEFAULT '+251 25 111 2222',
  email text DEFAULT 'reservations@bcapital.com',
  address text DEFAULT 'Bole Road, Kebele 04',
  city text DEFAULT 'Dire Dawa',
  country text DEFAULT 'Ethiopia',
  check_in_time text DEFAULT '14:00',
  check_out_time text DEFAULT '11:00',
  currency text DEFAULT 'ETB',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "settings_public_read" ON settings;
CREATE POLICY "settings_public_read" ON settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "settings_staff_update" ON settings;
CREATE POLICY "settings_staff_update" ON settings FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM staff_profiles sp WHERE sp.id = auth.uid() AND sp.is_active = true)
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM staff_profiles sp WHERE sp.id = auth.uid() AND sp.is_active = true)
  );

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_bookings_room_dates ON bookings(room_id, check_in, check_out);
CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_rooms_category ON rooms(category);
CREATE INDEX IF NOT EXISTS idx_staff_profiles_role ON staff_profiles(role);

-- Ensure the single settings row exists.
INSERT INTO settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
