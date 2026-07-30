import type { BookingStatus, PaymentStatus } from '../types';
import { STATUS_LABELS, PAYMENT_LABELS } from '../types';

const statusConfig: Record<BookingStatus, { dot: string; bg: string; text: string }> = {
  pending: { dot: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-700' },
  confirmed: { dot: 'bg-blue-500', bg: 'bg-blue-50', text: 'text-blue-700' },
  checked_in: { dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  checked_out: { dot: 'bg-ink-400', bg: 'bg-ink-50', text: 'text-ink-600' },
  cancelled: { dot: 'bg-red-500', bg: 'bg-red-50', text: 'text-red-600' },
};

const paymentConfig: Record<PaymentStatus, { dot: string; bg: string; text: string }> = {
  unpaid: { dot: 'bg-red-500', bg: 'bg-red-50', text: 'text-red-600' },
  paid: { dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  refunded: { dot: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-700' },
};

export function StatusBadge({ status }: { status: BookingStatus }) {
  const c = statusConfig[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${c.bg} ${c.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {STATUS_LABELS[status]}
    </span>
  );
}

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  const c = paymentConfig[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${c.bg} ${c.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {PAYMENT_LABELS[status]}
    </span>
  );
}
