import { useEffect, useMemo, useState } from 'react';
import {
  Search, DoorOpen, LogOut, Printer, Eye, X, Check, Loader2, Banknote,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Booking, BookingStatus, PaymentStatus } from '@/types';
import { STATUS_LABELS } from '@/types';
import { formatEtb, formatDate, todayISO } from '@/lib/format';
import { StatusBadge, PaymentBadge } from '@/components/Badges';
import { PageTitle, EmptyState, Toast } from '@/components/ui';
import { BookingDetailsModal } from '@/components/BookingDetailsModal';

const STATUS_FILTERS: (BookingStatus | 'all')[] = ['all', 'pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'];

export default function CashierOperations() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
  const [viewing, setViewing] = useState<Booking | null>(null);
  const [receipt, setReceipt] = useState<Booking | null>(null);
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
        (b.customer_phone_snapshot ?? '').toLowerCase().includes(q) ||
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

  const handleCheckIn = (b: Booking) =>
    updateBooking(b.id, { status: 'checked_in', checked_in_at: new Date().toISOString() }).then((ok) => ok && showToast(`${b.customer_name_snapshot ?? 'Guest'} checked in.`));

  const handleCheckOut = (b: Booking) =>
    updateBooking(b.id, { status: 'checked_out', checked_out_at: new Date().toISOString() }).then((ok) => ok && showToast(`${b.customer_name_snapshot ?? 'Guest'} checked out.`));

  const handleConfirm = (b: Booking) =>
    updateBooking(b.id, { status: 'confirmed' }).then((ok) => ok && showToast('Booking confirmed.'));

  const handleMarkPaid = (b: Booking) =>
    updateBooking(b.id, { payment_status: 'paid' }).then((ok) => ok && showToast('Payment marked as paid.'));

  const canCheckIn = (b: Booking) => b.status === 'confirmed' || b.status === 'pending';
  const canCheckOut = (b: Booking) => b.status === 'checked_in';
  const canConfirm = (b: Booking) => b.status === 'pending';
  const canPay = (b: Booking) => b.payment_status === 'unpaid' && b.status !== 'cancelled';

  return (
    <div>
      <PageTitle title="Front Desk Operations" subtitle="Check in guests, process payments, and manage stays." />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center animate-fade-in">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name, email, phone, or room…" className="input-luxe pl-10" />
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
                <div className="skeleton h-10 w-10 rounded-xl" />
                <div className="flex-1"><div className="skeleton h-5 w-32" /><div className="skeleton mt-2 h-3 w-48" /></div>
                <div className="skeleton h-8 w-24 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Search} title="No bookings found" message="Try adjusting your search or filter." />
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
                    {b.customer_phone_snapshot && <span>{b.customer_phone_snapshot}</span>}
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
                  <ActionBtn onClick={() => setReceipt(b)} disabled={false} icon={Printer} tone="neutral" label="Receipt" />
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
      {receipt && <ReceiptModal booking={receipt} onClose={() => setReceipt(null)} />}

      {toast && <Toast message={toast.msg} type={toast.type} />}
    </div>
  );
}

function ActionBtn({
  onClick, disabled, icon: Icon, tone, label, hideLabel,
}: {
  onClick: () => void; disabled: boolean; icon: typeof Check; tone: 'green' | 'blue' | 'ink' | 'gold' | 'neutral'; label: string; hideLabel?: boolean;
}) {
  const tones: Record<string, string> = {
    green: 'bg-emerald-600 text-white hover:bg-emerald-700',
    blue: 'bg-blue-600 text-white hover:bg-blue-700',
    ink: 'bg-ink-900 text-white hover:bg-ink-800',
    gold: 'bg-gold-400 text-ink-950 hover:bg-gold-300',
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

function ReceiptModal({ booking, onClose }: { booking: Booking; onClose: () => void }) {
  const receiptNo = `BC-${booking.id.slice(0, 8).toUpperCase()}`;
  const paid = booking.payment_status === 'paid';

  const handlePrint = () => {
    const content = document.getElementById('receipt-print-area');
    if (!content) return;
    const win = window.open('', '_blank', 'width=420,height=640');
    if (!win) {
      alert('Please allow popups to print receipts.');
      return;
    }
    win.document.write(`
      <html><head><title>Receipt ${receiptNo}</title>
      <style>
        body { font-family: 'Courier New', monospace; padding: 24px; color: #000; }
        h1 { font-size: 20px; margin: 0 0 4px; }
        .muted { color: #555; font-size: 12px; }
        hr { border: none; border-top: 1px dashed #999; margin: 12px 0; }
        table { width: 100%; font-size: 13px; }
        td { padding: 2px 0; }
        .right { text-align: right; }
        .total { font-size: 16px; font-weight: bold; }
        .center { text-align: center; }
      </style></head><body>${content.innerHTML}</body></html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white shadow-2xl animate-scale-in">
        <div className="flex items-center justify-between border-b border-ink-100 px-6 py-4">
          <h3 className="font-serif text-lg font-semibold text-ink-900">Receipt</h3>
          <button onClick={onClose} className="text-ink-400 hover:text-ink-900" aria-label="Close"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-6">
          <div id="receipt-print-area" className="font-mono text-sm text-ink-800">
            <div className="center">
              <p className="font-serif text-xl font-semibold">B Capital</p>
              <p className="muted">Dire Dawa, Ethiopia</p>
              <p className="muted">+251 25 111 2222</p>
            </div>
            <hr />
            <p><strong>Receipt No:</strong> {receiptNo}</p>
            <p><strong>Date:</strong> {formatDate(new Date())}</p>
            <hr />
            <p><strong>Guest:</strong> {booking.customer_name_snapshot ?? '—'}</p>
            <p><strong>Email:</strong> {booking.customer_email_snapshot ?? '—'}</p>
            {booking.customer_phone_snapshot && <p><strong>Phone:</strong> {booking.customer_phone_snapshot}</p>}
            <hr />
            <p><strong>Room:</strong> {booking.room?.name ?? '—'}</p>
            <p><strong>Check-in:</strong> {formatDate(booking.check_in)}</p>
            <p><strong>Check-out:</strong> {formatDate(booking.check_out)}</p>
            <p><strong>Nights:</strong> {booking.nights}</p>
            <p><strong>Guests:</strong> {booking.guests}</p>
            <hr />
            <table>
              <tbody>
                <tr>
                  <td>{formatEtb(booking.price_per_night)} × {booking.nights} night{booking.nights === 1 ? '' : 's'}</td>
                  <td className="right">{formatEtb(booking.total_amount)}</td>
                </tr>
                <tr className="total">
                  <td className="pt-2">TOTAL</td>
                  <td className="right pt-2">{formatEtb(booking.total_amount)}</td>
                </tr>
                <tr>
                  <td className="pt-3">Payment</td>
                  <td className="right pt-3">{paid ? 'PAID' : 'UNPAID'}</td>
                </tr>
                <tr>
                  <td>Method</td>
                  <td className="right">{booking.payment_method ?? 'pay_at_hotel'}</td>
                </tr>
              </tbody>
            </table>
            <hr />
            <p className="center muted">Thank you for staying at B Capital</p>
            <p className="center muted">We look forward to welcoming you again</p>
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-ink-100 pt-5">
            <button onClick={onClose} className="btn-outline">Close</button>
            <button onClick={handlePrint} className="btn-gold"><Printer className="h-4 w-4" /> Print Receipt</button>
          </div>
        </div>
      </div>
    </div>
  );
}
