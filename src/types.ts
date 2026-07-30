export type RoomCategory = 'standard' | 'deluxe' | 'executive' | 'suite';

export interface Room {
  id: string;
  name: string;
  category: RoomCategory;
  description: string;
  price: number;
  capacity: number;
  size_sqm: number | null;
  amenities: string[];
  image_urls: string[];
  is_available: boolean;
  room_number: string | null;
  floor: number | null;
  created_at: string;
}

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'checked_in'
  | 'checked_out'
  | 'cancelled';

export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';

export interface Booking {
  id: string;
  room_id: string;
  customer_id: string | null;
  customer_name_snapshot: string | null;
  customer_email_snapshot: string | null;
  customer_phone_snapshot: string | null;
  check_in: string;
  check_out: string;
  nights: number;
  guests: number;
  price_per_night: number;
  total_amount: number;
  status: BookingStatus;
  payment_status: PaymentStatus;
  payment_method: string | null;
  special_requests: string | null;
  checked_in_at: string | null;
  checked_out_at: string | null;
  created_at: string;
  room?: Pick<Room, 'id' | 'name' | 'category' | 'room_number' | 'price'>;
}

export type StaffRole = 'admin' | 'cashier';

export interface StaffProfile {
  id: string;
  email: string;
  full_name: string;
  role: StaffRole;
  is_active: boolean;
  created_at: string;
}

export interface CustomerProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  created_at: string;
}

export interface Settings {
  id: number;
  hotel_name: string;
  tagline: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  check_in_time: string;
  check_out_time: string;
  currency: string;
  updated_at: string;
}

export const CATEGORY_LABELS: Record<RoomCategory, string> = {
  standard: 'Standard',
  deluxe: 'Deluxe',
  executive: 'Executive',
  suite: 'Suite',
};

export const CATEGORY_ORDER: RoomCategory[] = ['standard', 'deluxe', 'executive', 'suite'];

export const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  checked_in: 'Checked In',
  checked_out: 'Checked Out',
  cancelled: 'Cancelled',
};

export const PAYMENT_LABELS: Record<PaymentStatus, string> = {
  unpaid: 'Unpaid',
  paid: 'Paid',
  refunded: 'Refunded',
};
