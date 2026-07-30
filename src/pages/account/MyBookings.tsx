import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CalendarCheck, CalendarX, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import type { Booking } from '@/types';
import { formatEtb, formatDate, todayISO } from '@/lib/format';
import { StatusBadge, PaymentBadge } from '@/components/Badges';
import { EmptyState, ConfirmDialog, Toast } from '@/components/ui';

export default function MyBookings() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (!user) return;
    supabase
      .from('bookings')
      .select('*, room:rooms(id, name, category, room_number)')
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setBookings(data ?? []);
        setLoading(false);
      });
  }, [user]);

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', cancelTarget.id);
    setCancelling(false);
    if (error) {
      showToast('Could not cancel booking. Please try again.', 'error');
    } else {
      setBookings((prev) =>
        prev.map((b) => (b.id === cancelTarget.id ? { ...b, status: 'cancelled' } : b))
      );
      showToast('Booking cancelled successfully.');
    }
    setCancelTarget(null);
  };

  const canCancel = (b: Booking) =>
    (b.status === 'pending' || b.status === 'confirmed') && b.check_in >= todayISO();

  const newBookingId = params.get('new');
  const newBooking = newBookingId ? bookings.find((b) => b.id === newBookingId) : null;

  return (
    <div>
      <div className="mb-8 animate-slide-right">
        <h1 className="font-serif text-2xl font-semibold text-ink-900 sm:text-3xl">My Bookings</h1>
        <p className="mt-1.5 text-sm text-ink-500">View and manage your reservations.</p>
      </div>

      {newBooking && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 animate-slide-down">
          <CalendarCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-emerald-800">Booking confirmed!</p>
            <p className="mt-0.5 text-sm text-emerald-700">
              Your reservation for {newBooking.room?.name} from {formatDate(newBooking.check_in)} to {formatDate(newBooking.check_out)} has been placed.
            </p>
          </div>
          <button
            onClick={() => { params.delete('new'); setParams(params); }}
            className="text-emerald-600 hover:text-emerald-800"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card-luxe p-6 animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="flex items-center gap-4">
                <div className="skeleton h-12 w-12 rounded-xl" />
                <div className="flex-1">
                  <div className="skeleton h-5 w-32" />
                  <div className="skeleton mt-2 h-3 w-48" />
                </div>
                <div className="skeleton h-8 w-24 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="No bookings yet"
          message="Your reservations will appear here once you book a stay."
          action={<Link to="/rooms" className="btn-gold">Browse rooms</Link>}
        />
      ) : (
        <div className="space-y-4">
          {bookings.map((b, i) => (
            <div
              key={b.id}
              className="card-luxe p-6 animate-fade-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-serif text-xl font-semibold text-ink-900">{b.room?.name ?? 'Room'}</h3>
                    <span className="text-xs text-ink-400">#{b.id.slice(0, 8).toUpperCase()}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-ink-600">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarCheck className="h-4 w-4 text-gold-500" />
                      {formatDate(b.check_in)}
                    </span>
                    <span className="text-ink-300">→</span>
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarX className="h-4 w-4 text-ink-400" />
                      {formatDate(b.check_out)}
                    </span>
                    <span className="text-ink-400">·</span>
                    <span>{b.nights} night{b.nights === 1 ? '' : 's'}</span>
                    <span className="text-ink-400">·</span>
                    <span>{b.guests} guest{b.guests === 1 ? '' : 's'}</span>
                  </div>
                  {b.special_requests && (
                    <p className="mt-3 rounded-lg bg-ink-50 px-4 py-2.5 text-sm text-ink-500">
                      <span className="font-medium text-ink-600">Note: </span>{b.special_requests}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-3">
                  <span className="font-serif text-2xl font-semibold text-gold-600">{formatEtb(b.total_amount)}</span>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={b.status} />
                    <PaymentBadge status={b.payment_status} />
                  </div>
                  {canCancel(b) && (
                    <button
                      onClick={() => setCancelTarget(b)}
                      className="text-xs font-semibold uppercase tracking-widest text-red-500 transition-colors hover:text-red-700"
                    >
                      Cancel booking
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancel}
        title="Cancel this booking?"
        message={`Are you sure you want to cancel your reservation for ${cancelTarget?.room?.name ?? 'this room'}? This action cannot be undone.`}
        confirmLabel={cancelling ? 'Cancelling…' : 'Yes, cancel'}
        tone="danger"
      />

      {toast && <Toast message={toast.msg} type={toast.type} />}
    </div>
  );
}
