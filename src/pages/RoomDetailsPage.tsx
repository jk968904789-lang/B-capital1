import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  Maximize,
  BedDouble,
  Check,
  CalendarDays,
  X,
  Loader2,
  CalendarCheck,
  LogIn,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import type { Room } from '@/types';
import { CATEGORY_LABELS } from '@/types';
import { formatEtb, todayISO, addDays, nightsBetween } from '@/lib/format';
import { checkAvailability, createCustomerBooking } from '@/lib/bookings';
import { PageHeader } from './RoomsPage';

export default function RoomDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [checkIn, setCheckIn] = useState(todayISO());
  const [checkOut, setCheckOut] = useState(addDays(todayISO(), 2));
  const [guests, setGuests] = useState(1);
  const [requests, setRequests] = useState('');
  const [availability, setAvailability] = useState<{ available: boolean; reason?: string } | null>(null);
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resultMsg, setResultMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!id) return;
    supabase
      .from('rooms')
      .select('*')
      .eq('id', id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!error && data) {
          setRoom(data);
        }
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (!room) return;
    setAvailability(null);
  }, [checkIn, checkOut, room]);

  const nights = nightsBetween(checkIn, checkOut);
  const total = room ? nights * room.price : 0;

  const handleCheck = async () => {
    if (!room || !id) return;
    setChecking(true);
    setResultMsg(null);
    const res = await checkAvailability(id, checkIn, checkOut);
    setAvailability({ available: res.available, reason: res.reason });
    setChecking(false);
  };

  const handleBook = async () => {
    if (!room || !id) return;
    if (!user || role !== 'customer') {
      navigate('/login', { state: { from: `/rooms/${id}` } });
      return;
    }
    setSubmitting(true);
    setResultMsg(null);
    const res = await createCustomerBooking({
      roomId: id,
      checkIn,
      checkOut,
      guests,
      specialRequests: requests,
    });
    setSubmitting(false);
    if (res.success && res.booking) {
      navigate('/account/bookings', {
        state: { newBooking: res.booking.id },
      });
    } else {
      setResultMsg({ type: 'error', text: res.error ?? 'Could not complete booking.' });
    }
  };

  if (loading) {
    return (
      <div className="bg-white">
        <div className="h-[60vh] skeleton rounded-none" />
        <div className="container-luxe py-20">
          <div className="skeleton h-8 w-64" />
          <div className="skeleton mt-4 h-4 w-96" />
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="bg-white">
        <PageHeader eyebrow="Rooms" title="Room not found" />
        <div className="container-luxe py-20 text-center">
          <p className="text-ink-500">We couldn't find that room.</p>
          <Link to="/rooms" className="btn-outline mt-6">Back to all rooms</Link>
        </div>
      </div>
    );
  }

  const images = room.image_urls.length ? room.image_urls : ['https://images.pexels.com/photos/6434592/pexels-photo-6434592.jpeg?auto=compress&cs=tinysrgb&w=1200'];

  return (
    <div className="bg-white pb-24">
      <PageHeader eyebrow={CATEGORY_LABELS[room.category]} title={room.name} />

      <div className="container-luxe relative z-10 -mt-20">
        <Link
          to="/rooms"
          className="inline-flex items-center gap-2 text-sm font-medium text-white transition-colors hover:text-gold-300"
        >
          <ArrowLeft className="h-4 w-4" /> Back to rooms
        </Link>
      </div>

      <div className="container-luxe mt-8 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        {/* Gallery */}
        <div>
          <div className="overflow-hidden rounded-2xl shadow-lg">
            <img
              src={images[activeImage]}
              alt={room.name}
              className="aspect-[16/10] w-full object-cover transition-opacity duration-300"
              key={activeImage}
              style={{ animation: 'fade-in 0.4s ease' }}
            />
          </div>
          {images.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-3">
              {images.map((img, i) => (
                <button
                  key={img}
                  onClick={() => setActiveImage(i)}
                  className={`overflow-hidden rounded-lg border-2 transition-all ${
                    activeImage === i ? 'border-gold-400' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="aspect-square w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="mt-10">
            <h2 className="font-serif text-2xl font-semibold text-ink-900">About this room</h2>
            <p className="mt-4 text-base leading-relaxed text-ink-600">{room.description}</p>
          </div>

          <div className="mt-10">
            <h3 className="font-serif text-xl font-semibold text-ink-900">Amenities</h3>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {room.amenities.map((a) => (
                <div key={a} className="flex items-center gap-2.5 text-sm text-ink-700">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold-50 text-gold-600">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  {a}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <SpecCard icon={Users} label="Capacity" value={`${room.capacity} guests`} />
            <SpecCard icon={Maximize} label="Size" value={room.size_sqm ? `${room.size_sqm} m²` : '—'} />
            <SpecCard icon={BedDouble} label="Room No." value={room.room_number ?? '—'} />
            <SpecCard icon={CalendarDays} label="Floor" value={room.floor ? `Floor ${room.floor}` : '—'} />
          </div>
        </div>

        {/* Booking widget */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <div className="card-luxe overflow-hidden shadow-lg">
            <div className="relative bg-ink-950 px-6 py-6 text-white">
              <div className="absolute inset-0 bg-gradient-to-br from-gold-500/10 to-transparent" />
              <p className="relative font-serif text-3xl font-semibold">{formatEtb(room.price)}</p>
              <p className="relative text-xs uppercase tracking-widest text-gold-300">per night</p>
            </div>
            <div className="p-6">
              {!room.is_available ? (
                <div className="rounded-lg bg-red-50 p-5 text-center">
                  <X className="mx-auto h-8 w-8 text-red-500" />
                  <p className="mt-3 font-medium text-red-700">This room is currently unavailable</p>
                  <p className="mt-1 text-sm text-red-600">Please choose another room.</p>
                  <Link to="/rooms" className="btn-outline mt-5 w-full">Browse rooms</Link>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label-luxe" htmlFor="checkin">Check-in</label>
                      <input
                        id="checkin"
                        type="date"
                        value={checkIn}
                        min={todayISO()}
                        onChange={(e) => setCheckIn(e.target.value)}
                        className="input-luxe"
                      />
                    </div>
                    <div>
                      <label className="label-luxe" htmlFor="checkout">Check-out</label>
                      <input
                        id="checkout"
                        type="date"
                        value={checkOut}
                        min={addDays(checkIn, 1)}
                        onChange={(e) => setCheckOut(e.target.value)}
                        className="input-luxe"
                      />
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="label-luxe" htmlFor="guests">Guests</label>
                    <select
                      id="guests"
                      value={guests}
                      onChange={(e) => setGuests(Number(e.target.value))}
                      className="input-luxe"
                    >
                      {Array.from({ length: room.capacity }).map((_, i) => (
                        <option key={i} value={i + 1}>{i + 1} {i === 0 ? 'guest' : 'guests'}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mt-3">
                    <label className="label-luxe" htmlFor="requests">Special requests (optional)</label>
                    <textarea
                      id="requests"
                      value={requests}
                      onChange={(e) => setRequests(e.target.value)}
                      rows={2}
                      placeholder="Late check-in, preferences…"
                      className="input-luxe resize-none"
                    />
                  </div>

                  <button
                    onClick={handleCheck}
                    disabled={checking || nights <= 0}
                    className="btn-outline mt-4 w-full"
                  >
                    {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarDays className="h-4 w-4" />}
                    Check Availability
                  </button>

                  {availability && (
                    <div
                      className={`mt-3 rounded-lg p-3 text-sm ${
                        availability.available
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {availability.available ? (
                        <span className="flex items-center gap-2"><Check className="h-4 w-4" /> Available for your dates</span>
                      ) : (
                        <span className="flex items-center gap-2"><X className="h-4 w-4" /> {availability.reason}</span>
                      )}
                    </div>
                  )}

                  {nights > 0 && (
                    <div className="mt-5 border-t border-ink-100 pt-5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-ink-500">{formatEtb(room.price)} × {nights} night{nights === 1 ? '' : 's'}</span>
                        <span className="font-medium text-ink-900">{formatEtb(total)}</span>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="font-semibold text-ink-900">Total</span>
                        <span className="font-serif text-2xl font-semibold text-gold-600">{formatEtb(total)}</span>
                      </div>
                      <p className="mt-2 text-xs text-ink-400">Payment is collected at the hotel — no online payment required.</p>
                    </div>
                  )}

                  {resultMsg && (
                    <div className={`mt-4 rounded-lg p-3 text-sm ${resultMsg.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
                      {resultMsg.text}
                    </div>
                  )}

                  {user && role === 'customer' ? (
                    <button
                      onClick={handleBook}
                      disabled={submitting || nights <= 0}
                      className="btn-gold mt-5 w-full"
                    >
                      {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarCheck className="h-4 w-4" />}
                      Reserve Now
                    </button>
                  ) : user && (role === 'admin' || role === 'cashier') ? (
                    <div className="mt-5 rounded-lg bg-ink-50 p-3 text-center text-sm text-ink-500">
                      Staff accounts book through the dashboard.
                    </div>
                  ) : (
                    <Link to="/login" state={{ from: `/rooms/${id}` }} className="btn-gold mt-5 w-full">
                      <LogIn className="h-4 w-4" />
                      Sign in to book
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SpecCard({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-ink-100 p-4 text-center transition-all duration-300 hover:border-gold-200 hover:shadow-sm">
      <Icon className="mx-auto h-5 w-5 text-gold-500" />
      <p className="mt-2 text-[11px] uppercase tracking-widest text-ink-400">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-ink-900">{value}</p>
    </div>
  );
}
