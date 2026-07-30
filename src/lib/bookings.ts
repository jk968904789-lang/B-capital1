import { supabase } from './supabase';
import type { Booking } from '../types';

export interface AvailabilityResult {
  available: boolean;
  reason?: string;
  conflictingBookingId?: string;
}

/**
 * Checks whether a room is available for the given date range.
 * A room is unavailable if any non-cancelled booking overlaps the range.
 */
export async function checkAvailability(
  roomId: string,
  checkIn: string,
  checkOut: string
): Promise<AvailabilityResult> {
  if (!roomId || !checkIn || !checkOut) {
    return { available: false, reason: 'Incomplete dates' };
  }
  if (checkOut <= checkIn) {
    return { available: false, reason: 'Check-out must be after check-in' };
  }

  const { data: room } = await supabase
    .from('rooms')
    .select('is_available')
    .eq('id', roomId)
    .maybeSingle();

  if (!room) return { available: false, reason: 'Room not found' };
  if (!room.is_available) return { available: false, reason: 'This room is currently not bookable' };

  const { data: conflicts } = await supabase
    .from('bookings')
    .select('id')
    .eq('room_id', roomId)
    .neq('status', 'cancelled')
    .lt('check_in', checkOut)
    .gt('check_out', checkIn);

  if (conflicts && conflicts.length > 0) {
    return { available: false, reason: 'Room is already booked for these dates', conflictingBookingId: conflicts[0].id };
  }
  return { available: true };
}

export interface CreateBookingInput {
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  specialRequests?: string;
}

export interface CreateBookingResult {
  success: boolean;
  booking?: Booking;
  error?: string;
}

export async function createCustomerBooking(
  input: CreateBookingInput
): Promise<CreateBookingResult> {
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData.user) {
    return { success: false, error: 'You must be signed in to book a room.' };
  }

  const { data: room, error: roomErr } = await supabase
    .from('rooms')
    .select('id, price, capacity, name')
    .eq('id', input.roomId)
    .maybeSingle();

  if (roomErr || !room) {
    return { success: false, error: 'Room not found.' };
  }
  if (input.guests > room.capacity) {
    return { success: false, error: `This room accommodates up to ${room.capacity} guests.` };
  }

  const avail = await checkAvailability(input.roomId, input.checkIn, input.checkOut);
  if (!avail.available) {
    return { success: false, error: avail.reason ?? 'Room not available for these dates.' };
  }

  const { data: profile } = await supabase
    .from('customer_profiles')
    .select('full_name, email, phone')
    .eq('id', userData.user.id)
    .maybeSingle();

  const start = new Date(input.checkIn);
  const end = new Date(input.checkOut);
  const nights = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const total = nights * Number(room.price);

  const { data: booking, error: bookingErr } = await supabase
    .from('bookings')
    .insert({
      room_id: input.roomId,
      customer_id: userData.user.id,
      customer_name_snapshot: profile?.full_name ?? userData.user.email,
      customer_email_snapshot: profile?.email ?? userData.user.email,
      customer_phone_snapshot: profile?.phone ?? null,
      check_in: input.checkIn,
      check_out: input.checkOut,
      nights,
      guests: input.guests,
      price_per_night: Number(room.price),
      total_amount: total,
      status: 'pending',
      payment_status: 'unpaid',
      payment_method: 'pay_at_hotel',
      special_requests: input.specialRequests || null,
    })
    .select('*')
    .single();

  if (bookingErr) {
    if (bookingErr.code === '23P01') {
      return { success: false, error: 'This room was just booked for those dates. Please try different dates.' };
    }
    return { success: false, error: bookingErr.message };
  }
  return { success: true, booking: booking as Booking };
}
