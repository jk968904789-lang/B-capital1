-- ============================================================
-- Prevent double-booking via an exclusion constraint
-- ============================================================
-- Two non-cancelled bookings for the same room can never overlap in
-- date range. This makes the availability check + insert in
-- createCustomerBooking safe against concurrent bookings — the second
-- insert will fail at the database level instead of silently succeeding.
--
-- Requires the btree_gist extension so we can combine an equality
-- check (room_id) with a range exclusion (daterange) in a GiST index.

CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Add the constraint. We exclude cancelled bookings so a cancelled
-- reservation does not block the room from being rebooked.
ALTER TABLE bookings
  ADD CONSTRAINT bookings_no_overlap
  EXCLUDE USING gist (
    room_id WITH =,
    daterange(check_in, check_out, '[)') WITH &&
  ) WHERE (status <> 'cancelled');
