import { useEffect, useState } from 'react';
import {
  CalendarCheck, Search, Eye, X, Check, DoorOpen, LogOut, Banknote,
  Ban, Loader2, Pencil,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Booking, BookingStatus } from '@/types';
import { STATUS_LABELS } from '@/types';
import { formatEtb, formatDate } from '@/lib/format';
import { StatusBadge, PaymentBadge } from '@/components/Badges';
import { BookingDetailsModal } from '@/components/BookingDetailsModal';
import { PageTitle, EmptyState, Toast } from '@/components/ui';

const STATUS_FILTERS: (BookingStatus | 'all')[] = ['all', 'pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'];

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
  const [viewing, setViewing] = useState<Booking | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const load = () => {
    setLoading(true);
    supabase
      .from('bookings')
      .select('*, room:rooms(id, name, category, room_number, price)')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) { showToast('Could not load bookings.', 'error'); }
        setBookings(data ?? []);
        setLoading(false);
      });
  };

  useEffect(() => { load(); }, []);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = bookings.filter((b) => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    if (query) {
      const q = query.toLowerCase();
      return (
        (b.customer_name_snapshot ?? '').toLowerCase().includes(q) ||
        (b.customer_email_snapshot ?? '').toLowerCase().includes(q) ||
        (b.room?.name ?? '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const updateBooking = async (id: string, patch: Partial<Booking>) => {
    setBusy(id);
    const { error } = await supabase.from('bookings').update(patch).eq('id', id);
    setBusy(null);
    if (error) {
      showToast(error.message, 'error');
      return false;
    }
    load();
    return true;
  };

  const handleConfirm = (b: Booking) =>
    updateBooking(b.id, { status: 'confirmed' }).then((ok) => ok && showToast('Booking confirmed.'));
  const handleCancel = (b: Booking) =>
    updateBooking(b.id, { status: 'cancelled' }).then((ok) => ok && showToast('Booking cancelled.'));
  const handleCheckIn = (b: Booking) =>
    updateBooking(b.id, { status: 'checked_in', checked_in_at: new Date().toISOString() }).then((ok) => ok && showToast('Guest checked in.'));
  const handleCheckOut = (b: Booking) =>
    updateBooking(b.id, { status: 'checked_out', checked_out_at: new Date().toISOString() }).then((ok) => ok && showToast('Guest checked out.'));
  const handleMarkPaid = (b: Booking) =>
    updateBooking(b.id, { payment_status: 'paid' }).then((ok) => ok && showToast('Payment marked as paid.'));

  const canConfirm = (b: Booking) => b.status === 'pending';
  const canCancel = (b: Booking) => b.status === 'pending' || b.status === 'confirmed';
  const canCheckIn = (b: Booking) => b.status === 'confirmed' || b.status === 'pending';
  const canCheckOut = (b: Booking) => b.status === 'checked_in';
  const canPay = (b: Booking) => b.payment_status === 'unpaid' && b.status !== 'cancelled';

  return (
    <div>
      <PageTitle title="Booking Management" subtitle="View and manage all guest reservations." />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center animate-fade-in">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by guest, email, or room…" className="input-luxe pl-10" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as BookingStatus | 'all')} className="input-luxe sm:w-48">
          {STATUS_FILTERS.map((s) => <option key={s} value={s}>{s === 'all' ? 'All Statuses' : STATUS_LABELS[s]}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card-luxe p-5 animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex items-center gap-4">
                <div className="skeleton h-5 w-32" />
                <div className="flex-1"><div className="skeleton mt-2 h-3 w-48" /></div>
                <div className="skeleton h-8 w-24 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={CalendarCheck} title="No bookings found" message="Bookings will appear here once guests make reservations." />
      ) : (
        <div className="space-y-3">
          {filtered.map((b, i) => (
            <div key={b.id} className="card-luxe p-5 animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-serif text-lg font-semibold text-ink-900">{b.customer_name_snapshot ?? 'Walk-in'}</h3>
                    <StatusBadge status={b.status} />
                    <PaymentBadge status={b.payment_status} />
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-500">
                    <span className="font-medium text-ink-700">{b.room?.name ?? '—'}</span>
                    <span>{formatDate(b.check_in)} → {formatDate(b.check_out)}</span>
                    <span>{b.nights}n · {b.guests} guest{b.guests === 1 ? '' : 's'}</span>
                    {b.customer_email_snapshot && <span>{b.customer_email_snapshot}</span>}
                  </div>
                </div>

                <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
                  <span className="font-serif text-xl font-semibold text-gold-600">{formatEtb(b.total_amount)}</span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {canConfirm(b) && (
                    <ActionBtn onClick={() => handleConfirm(b)} disabled={busy === b.id} icon={Check} tone="blue" label="Confirm" />
                  )}
                  {canCheckIn(b) && (
                    <ActionBtn onClick={() => handleCheckIn(b)} disabled={busy === b.id} icon={DoorOpen} tone="green" label="Check In" />
                  )}
                  {canCheckOut(b) && (
                    <ActionBtn onClick={() => handleCheckOut(b)} disabled={busy === b.id} icon={LogOut} tone="ink" label="Check Out" />
                  )}
                  {canPay(b) && (
                    <ActionBtn onClick={() => handleMarkPaid(b)} disabled={busy === b.id} icon={Banknote} tone="gold" label="Mark Paid" />
                  )}
                  {canCancel(b) && (
                    <ActionBtn onClick={() => handleCancel(b)} disabled={busy === b.id} icon={Ban} tone="red" label="Cancel" />
                  )}
                  <ActionBtn onClick={() => setViewing(b)} disabled={false} icon={Eye} tone="neutral" label="" hideLabel />
                </div>
              </div>
              {busy === b.id && (
                <div className="mt-2 flex items-center gap-2 text-xs text-ink-400">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Updating…
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {viewing && <BookingDetailsModal booking={viewing} onClose={() => setViewing(null)} />}
      {toast && <Toast message={toast.msg} type={toast.type} />}
    </div>
  );
}

function ActionBtn({
  onClick, disabled, icon: Icon, tone, label, hideLabel,
}: {
  onClick: () => void; disabled: boolean; icon: typeof Check; tone: 'green' | 'blue' | 'ink' | 'gold' | 'red' | 'neutral'; label: string; hideLabel?: boolean;
}) {
  const tones: Record<string, string> = {
    green: 'bg-emerald-600 text-white hover:bg-emerald-700',
    blue: 'bg-blue-600 text-white hover:bg-blue-700',
    ink: 'bg-ink-900 text-white hover:bg-ink-800',
    gold: 'bg-gold-400 text-ink-950 hover:bg-gold-300',
    red: 'bg-red-600 text-white hover:bg-red-700',
    neutral: 'border border-ink-200 text-ink-700 hover:bg-ink-50',
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold uppercase tracking-wide transition-colors disabled:opacity-50 ${tones[tone]}`}
      title={label}
    >
      {disabled ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Icon className="h-3.5 w-3.5" />}
      {!hideLabel && label}
    </button>
  );
}

