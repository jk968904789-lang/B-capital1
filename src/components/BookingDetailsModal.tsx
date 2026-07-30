import { X } from 'lucide-react';
import type { Booking } from '@/types';
import { formatEtb, formatDate, formatDateTime } from '@/lib/format';
import { StatusBadge, PaymentBadge } from '@/components/Badges';
import { Modal } from '@/components/ui';

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  pay_at_hotel: 'Pay at Hotel',
  cash: 'Cash',
  card: 'Card',
  bank_transfer: 'Bank Transfer',
};

export function BookingDetailsModal({ booking, onClose }: { booking: Booking; onClose: () => void }) {
  return (
    <Modal open={true} onClose={onClose} title="Booking Details" size="lg">
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-serif text-xl font-semibold text-ink-900">{booking.room?.name ?? 'Room'}</h4>
            <p className="text-sm text-ink-500">Booking ID: {booking.id.slice(0, 8).toUpperCase()}</p>
          </div>
          <div className="flex gap-2">
            <StatusBadge status={booking.status} />
            <PaymentBadge status={booking.payment_status} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <DetailRow label="Guest Name" value={booking.customer_name_snapshot ?? '—'} />
          <DetailRow label="Email" value={booking.customer_email_snapshot ?? '—'} />
          <DetailRow label="Phone" value={booking.customer_phone_snapshot ?? '—'} />
          <DetailRow label="Guests" value={String(booking.guests)} />
          <DetailRow label="Check-in" value={formatDate(booking.check_in)} />
          <DetailRow label="Check-out" value={formatDate(booking.check_out)} />
          <DetailRow label="Nights" value={String(booking.nights)} />
          <DetailRow label="Price / night" value={formatEtb(booking.price_per_night)} />
          <DetailRow label="Total" value={formatEtb(booking.total_amount)} bold />
          <DetailRow label="Payment Method" value={PAYMENT_METHOD_LABELS[booking.payment_method ?? 'pay_at_hotel'] ?? booking.payment_method ?? 'Pay at Hotel'} />
        </div>

        {booking.special_requests && (
          <div className="rounded-lg bg-ink-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-ink-400">Special Requests</p>
            <p className="mt-1 text-sm text-ink-700">{booking.special_requests}</p>
          </div>
        )}

        {booking.checked_in_at && <DetailRow label="Checked In" value={formatDateTime(booking.checked_in_at)} />}
        {booking.checked_out_at && <DetailRow label="Checked Out" value={formatDateTime(booking.checked_out_at)} />}

        <div className="flex justify-end border-t border-ink-100 pt-5">
          <button onClick={onClose} className="btn-outline"><X className="h-4 w-4" /> Close</button>
        </div>
      </div>
    </Modal>
  );
}

function DetailRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-ink-400">{label}</p>
      <p className={`mt-0.5 text-sm ${bold ? 'font-serif text-lg font-semibold text-gold-600' : 'text-ink-800'}`}>{value}</p>
    </div>
  );
}
