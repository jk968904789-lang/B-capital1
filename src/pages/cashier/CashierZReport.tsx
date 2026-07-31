import { useEffect, useState } from 'react';
import { Printer, FileText, TrendingUp, Banknote, Receipt } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Booking } from '@/types';
import { formatEtb, formatDate, todayISO } from '@/lib/format';
import { PageTitle, StatCard, StatSkeleton, EmptyState, ErrorState } from '@/components/ui';

export default function CashierZReport() {
  const [date, setDate] = useState(todayISO());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [printed, setPrinted] = useState(false);

  const [error, setError] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
      const { data } = await supabase
        .from('bookings')
        .select('*, room:rooms(id, name, category)')
        .eq('payment_status', 'paid')
        .gte('created_at', `${date}T00:00:00`)
        .lte('created_at', `${date}T23:59:59.999`)
        .order('created_at', { ascending: true });
      setBookings(data ?? []);
      } catch { setError(true); }
      setLoading(false);
    })();
  }, [date]);

  const totalCollected = bookings.reduce((s, b) => s + Number(b.total_amount), 0);
  const transactionCount = bookings.length;
  const avgTransaction = transactionCount > 0 ? totalCollected / transactionCount : 0;
  const paymentMethods = new Map<string, number>();
  bookings.forEach((b) => {
    const method = b.payment_method ?? 'pay_at_hotel';
    paymentMethods.set(method, (paymentMethods.get(method) ?? 0) + 1);
  });
  const paymentMethodSummary = Array.from(paymentMethods.entries())
    .map(([method, count]) => `${method.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())} (${count})`)
    .join(', ') || '—';

  const handlePrint = () => {
    setPrinted(true);
    window.print();
  };

  return (
    <div>
      <PageTitle title="Z Report" subtitle="End-of-day financial close — paid transactions only." />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <label className="label-luxe">Report Date</label>
          <input type="date" value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)} className="input-luxe sm:w-52" />
        </div>
        <button onClick={handlePrint} className="btn-gold print:hidden"><Printer className="h-4 w-4" /> Print Z Report</button>
      </div>

      {loading ? (
        <div>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatSkeleton delay={0} /><StatSkeleton delay={80} /><StatSkeleton delay={160} />
          </div>
          <div className="mt-6 skeleton h-48 rounded-2xl" />
        </div>
      ) : error ? (
        <ErrorState onRetry={() => window.location.reload()} />
      ) : bookings.length === 0 ? (
        <EmptyState icon={FileText} title="No paid transactions" message={`No paid transactions recorded on ${formatDate(date)}.`} />
      ) : (
        <>
          <div id="z-report-print" className="space-y-6">
            <div className="card-luxe overflow-hidden animate-fade-up">
              <div className="bg-ink-950 px-6 py-5 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-serif text-2xl font-semibold">Z Report</p>
                    <p className="text-sm text-gold-300">B Capital · {formatDate(date)}</p>
                  </div>
                  <FileText className="h-8 w-8 text-gold-400" />
                </div>
              </div>
              <div className="p-6">
                <div className="grid gap-4 sm:grid-cols-3">
                  <StatCard label="Total Collected" value={formatEtb(totalCollected)} icon={Banknote} tone="gold" delay={0} />
                  <StatCard label="Transactions" value={transactionCount} icon={Receipt} delay={80} />
                  <StatCard label="Avg Transaction" value={formatEtb(avgTransaction)} icon={TrendingUp} delay={160} />
                </div>
              </div>
            </div>

            <div className="card-luxe p-6 animate-fade-up" style={{ animationDelay: '120ms' }}>
              <h3 className="font-serif text-lg font-semibold text-ink-900">Transaction Ledger</h3>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase tracking-widest text-ink-400">
                    <tr>
                      <th className="py-2">#</th>
                      <th className="py-2">Receipt</th>
                      <th className="py-2">Guest</th>
                      <th className="py-2">Room</th>
                      <th className="py-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-50">
                    {bookings.map((b, i) => (
                      <tr key={b.id}>
                        <td className="py-2.5 text-ink-400">{i + 1}</td>
                        <td className="py-2.5 font-mono text-xs text-ink-600">BC-{b.id.slice(0, 8).toUpperCase()}</td>
                        <td className="py-2.5 text-ink-900">{b.customer_name_snapshot ?? '—'}</td>
                        <td className="py-2.5 text-ink-600">{b.room?.name ?? '—'}</td>
                        <td className="py-2.5 text-right font-medium text-ink-900">{formatEtb(b.total_amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-ink-200">
                      <td colSpan={4} className="py-4 text-right font-serif text-lg font-semibold text-ink-900">Grand Total:</td>
                      <td className="py-4 text-right font-serif text-xl font-semibold text-gold-600">{formatEtb(totalCollected)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="card-luxe p-6 animate-fade-up" style={{ animationDelay: '200ms' }}>
              <h3 className="font-serif text-lg font-semibold text-ink-900">Close Summary</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <SummaryRow label="Report Date" value={formatDate(date)} />
                <SummaryRow label="Total Transactions" value={String(transactionCount)} />
                <SummaryRow label="Total Collected" value={formatEtb(totalCollected)} bold />
                <SummaryRow label="Average Transaction" value={formatEtb(avgTransaction)} />
                <SummaryRow label="Payment Methods" value={paymentMethodSummary} />
                <SummaryRow label="Report Status" value={printed ? 'Closed' : 'Open'} />
              </div>
              <div className="mt-6 border-t border-ink-100 pt-4">
                <p className="text-xs text-ink-400">
                  This Z report summarizes all paid transactions for {formatDate(date)}.
                  Print and retain for your records. Generated by B Capital management system.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function SummaryRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-ink-50 pb-2">
      <span className="text-sm text-ink-500">{label}</span>
      <span className={`text-sm ${bold ? 'font-serif text-lg font-semibold text-gold-600' : 'font-medium text-ink-900'}`}>{value}</span>
    </div>
  );
}
