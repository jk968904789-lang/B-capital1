/*
# Seed demo bookings

1. Purpose
   Populate the `bookings` table with realistic demo reservations so the Admin and
   Cashier dashboards, reports, and front-desk operations have meaningful data to
   display during demonstration to a hotel owner.

2. Data inserted
   - 6 demo bookings spanning different statuses and payment states:
     * 1 checked-in + paid (currently in house)
     * 1 checked-in + unpaid (in house, payment pending)
     * 1 confirmed + unpaid (upcoming arrival today)
     * 1 pending + unpaid (upcoming in a few days)
     * 1 checked-out + paid (historical, completed stay)
     * 1 checked-out + unpaid (historical, completed stay)
   - These use the real room IDs from the seeded rooms.
   - Bookings use snapshot fields (customer_name_snapshot etc.) so they display
     correctly regardless of customer account state.

3. Notes
   - customer_id is set to NULL (walk-in style) so these don't depend on an auth
     user existing. The snapshot fields carry the guest's name/contact for display.
   - Dates are computed relative to CURRENT_DATE so the demo always looks current.
   - ON CONFLICT DO NOTHING keeps it idempotent.
   - price_per_night and total_amount are snapshotted from the room prices.
*/

DO $$
DECLARE
  r_standard uuid;
  r_deluxe uuid;
  r_executive uuid;
  r_suite uuid;
  today date := CURRENT_DATE;
BEGIN
  SELECT id INTO r_standard FROM rooms WHERE name = 'Standard 101' LIMIT 1;
  SELECT id INTO r_deluxe   FROM rooms WHERE name = 'Deluxe 201' LIMIT 1;
  SELECT id INTO r_executive FROM rooms WHERE name = 'Executive 301' LIMIT 1;
  SELECT id INTO r_suite    FROM rooms WHERE name = 'Capital Suite 401' LIMIT 1;

  -- 1. Checked-in, paid (currently in house) — Hanan Ahmed
  INSERT INTO bookings (room_id, customer_id, customer_name_snapshot, customer_email_snapshot, customer_phone_snapshot, check_in, check_out, nights, guests, price_per_night, total_amount, status, payment_status, payment_method, checked_in_at, created_at)
  VALUES (r_suite, NULL, 'Hanan Ahmed', 'hanan.ahmed@email.com', '+251 91 234 5678', today - 1, today + 2, 3, 2, 15000.00, 45000.00, 'checked_in', 'paid', 'pay_at_hotel', now() - interval '1 day', now() - interval '3 days')
  ON CONFLICT DO NOTHING;

  -- 2. Checked-in, unpaid (in house, payment pending) — Daniel Bekele
  INSERT INTO bookings (room_id, customer_id, customer_name_snapshot, customer_email_snapshot, customer_phone_snapshot, check_in, check_out, nights, guests, price_per_night, total_amount, status, payment_status, payment_method, checked_in_at, created_at)
  VALUES (r_deluxe, NULL, 'Daniel Bekele', 'daniel.bekele@email.com', '+251 91 345 6789', today, today + 3, 3, 2, 6500.00, 19500.00, 'checked_in', 'unpaid', 'pay_at_hotel', now() - interval '2 hours', now() - interval '1 day')
  ON CONFLICT DO NOTHING;

  -- 3. Confirmed, unpaid (arriving today) — Sara Mohammed
  INSERT INTO bookings (room_id, customer_id, customer_name_snapshot, customer_email_snapshot, customer_phone_snapshot, check_in, check_out, nights, guests, price_per_night, total_amount, status, payment_status, payment_method, created_at)
  VALUES (r_executive, NULL, 'Sara Mohammed', 'sara.mohammed@email.com', '+251 91 456 7890', today, today + 2, 2, 1, 9500.00, 19000.00, 'confirmed', 'unpaid', 'pay_at_hotel', now() - interval '2 days')
  ON CONFLICT DO NOTHING;

  -- 4. Pending, unpaid (upcoming in a few days) — Yonas Tesfaye
  INSERT INTO bookings (room_id, customer_id, customer_name_snapshot, customer_email_snapshot, customer_phone_snapshot, check_in, check_out, nights, guests, price_per_night, total_amount, status, payment_status, payment_method, created_at)
  VALUES (r_standard, NULL, 'Yonas Tesfaye', 'yonas.tesfaye@email.com', '+251 91 567 8901', today + 4, today + 6, 2, 2, 3500.00, 7000.00, 'pending', 'unpaid', 'pay_at_hotel', now() - interval '1 day')
  ON CONFLICT DO NOTHING;

  -- 5. Checked-out, paid (completed stay, yesterday checkout) — Meron Girma
  INSERT INTO bookings (room_id, customer_id, customer_name_snapshot, customer_email_snapshot, customer_phone_snapshot, check_in, check_out, nights, guests, price_per_night, total_amount, status, payment_status, payment_method, checked_in_at, checked_out_at, created_at)
  VALUES (r_deluxe, NULL, 'Meron Girma', 'meron.girma@email.com', '+251 91 678 9012', today - 4, today - 1, 3, 2, 6500.00, 19500.00, 'checked_out', 'paid', 'pay_at_hotel', now() - interval '4 days', now() - interval '1 day', now() - interval '6 days')
  ON CONFLICT DO NOTHING;

  -- 6. Checked-out, paid (completed stay last week) — Abebe Lemma
  INSERT INTO bookings (room_id, customer_id, customer_name_snapshot, customer_email_snapshot, customer_phone_snapshot, check_in, check_out, nights, guests, price_per_night, total_amount, status, payment_status, payment_method, checked_in_at, checked_out_at, created_at)
  VALUES (r_standard, NULL, 'Abebe Lemma', 'abebe.lemma@email.com', '+251 91 789 0123', today - 7, today - 5, 2, 1, 3500.00, 7000.00, 'checked_out', 'paid', 'pay_at_hotel', now() - interval '7 days', now() - interval '5 days', now() - interval '9 days')
  ON CONFLICT DO NOTHING;
END $$;
