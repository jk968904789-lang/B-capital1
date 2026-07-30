import { useEffect, useState } from 'react';
import { Printer, Calendar, TrendingUp, Banknote, DoorOpen, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Booking } from '@/types';
import { formatEtb, formatDate, todayISO } from '@/lib/format';
import { StatusBadge, PaymentBadge } from '@/components/Badges';
import { PageTitle, StatCard, StatSkeleton, ErrorState } from '@/components/ui';

export default function CashierDailyReport() {
  const [date, setDate] = useState(todayISO());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [arrivals, setArrivals] = useState<Booking[]>([]);
  const [departures, setDepartures] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
      const [{ data }, { data: arr }, { data: dep }] = await Promise.all([
        supabase.from('bookings').select('*, room:rooms(id, name, category)').gte('created_at', `${date}T00:00:00`).lte('created_at', `${date}T23:59:59.999`).order('created_at', { ascending: false }),
        supabase.from('bookings').select('*, room:rooms(id, name, category)').eq('check_in', date).neq('status', 'cancelled'),
        supabase.from('bookings').select('*, room:rooms(id, name, category)').eq('check_out', date).neq('status', 'cancelled'),
      ]);
      setBookings(data ?? []);
      setArrivals(arr ?? []);
      setDepartures(dep ?? []);
      } catch { setError(true); }
      setLoading(false);
    })();
  }, [date]);

  const paid = bookings.filter((b) => b.payment_status === 'paid');
  const collected = paid.reduce((s, b) => s + Number(b.total_amount), 0);
  const paidCount = paid.length;

  const handlePrint = () => window.print();

  return (
    <div>
      <PageTitle title="Daily Report" subtitle="A summary of today's front desk activity." />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <label className="label-luxe">Report Date</label>
          <input type="date" value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)} className="input-luxe sm:w-52" />
        </div>
        <button onClick={handlePrint} className="btn-outline print:hidden"><Printer className="h-4 w-4" /> Print Report</button>
      </div>

      {loading ? (
        <div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatSkeleton delay={0} /><StatSkeleton delay={80} /><StatSkeleton delay={160} /><StatSkeleton delay={240} />
          </div>
          <div className="mt-6 skeleton h-64 rounded-2xl" />
        </div>
      ) : error ? (
        <ErrorState onRetry={() => window.location.reload()} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Bookings" value={bookings.length} icon={Calendar} delay={0} />
            <StatCard label="Paid Bookings" value={paidCount} icon={Banknote} hint={`${formatEtb(collected)} collected`} tone="gold" delay={80} />
            <StatCard label="Arrivals" value={arrivals.length} icon={DoorOpen} delay={160} />
            <StatCard label="Departures" value={departures.length} icon={LogOut} delay={240} />
          </div>

          <div className="mt-6 card-luxe p-6 animate-fade-up" style={{ animationDelay: '300ms' }}>
            <h3 className="font-serif text-lg font-semibold text-ink-900">Bookings — {formatDate(date)}</h3>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-widest text-ink-400">
                  <tr>
                    <th className="py-2">Guest</th><th className="py-2">Room</th><th className="py-2">Dates</th>
                    <th className="py-2">Amount</th><th className="py-2">Payment</th><th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-50">
                  {bookings.length === 0 ? (
                    <tr><td colSpan={6} className="py-8 text-center text-ink-400">No bookings on this date.</td></tr>
                  ) : bookings.map((b) => (
                    <tr key={b.id}>
                      <td className="py-2.5 text-ink-900">{b.customer_name_snapshot ?? '—'}</td>
                      <td className="py-2.5 text-ink-600">{b.room?.name ?? '—'}</td>
                      <td className="py-2.5 text-ink-600">{formatDate(b.check_in)} → {formatDate(b.check_out)}</td>
                      <td className="py-2.5 font-medium text-ink-900">{formatEtb(b.total_amount)}</td>
                      <td className="py-2.5"><PaymentBadge status={b.payment_status} /></td>
                      <td className="py-2.5"><StatusBadge status={b.status} /></td>
                    </tr>
                  ))}
                </tbody>
                {bookings.length > 0 && (
                  <tfoot>
                    <tr className="border-t-2 border-ink-200 font-semibold">
                      <td colSpan={3} className="py-3 text-right text-ink-700">Total Collected:</td>
                      <td className="py-3 font-serif text-lg text-gold-600">{formatEtb(collected)}</td>
                      <td colSpan={2}></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
