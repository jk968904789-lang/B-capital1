import { useEffect, useMemo, useState } from 'react';
import { Calendar, TrendingUp, BookOpen, DoorOpen, Printer } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Booking } from '@/types';
import { STATUS_LABELS } from '@/types';
import { formatEtb, formatDate, todayISO, addDays } from '@/lib/format';
import { StatusBadge, PaymentBadge } from '@/components/Badges';
import { PageTitle, StatCard, LoadingState, ErrorState } from '@/components/ui';

type Tab = 'daily' | 'revenue' | 'booking' | 'occupancy';

export default function AdminReports() {
  const [tab, setTab] = useState<Tab>('daily');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [roomCount, setRoomCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [reportDate, setReportDate] = useState(todayISO());

  const [error, setError] = useState(false);

  useEffect(() => {
    (async () => {
      try {
      const [{ data }, { count }] = await Promise.all([
        supabase.from('bookings').select('*, room:rooms(id,name,category,room_number)').order('created_at', { ascending: false }),
        supabase.from('rooms').select('*', { count: 'exact', head: true }),
      ]);
      setBookings(data ?? []);
      setRoomCount(count ?? 0);
      } catch { setError(true); }
      setLoading(false);
    })();
  }, []);

  const tabs: { id: Tab; label: string; icon: typeof Calendar }[] = [
    { id: 'daily', label: 'Daily Report', icon: Calendar },
    { id: 'revenue', label: 'Revenue Report', icon: TrendingUp },
    { id: 'booking', label: 'Booking Report', icon: BookOpen },
    { id: 'occupancy', label: 'Occupancy Report', icon: DoorOpen },
  ];

  if (loading) return <LoadingState label="Loading reports…" />;
  if (error) return <ErrorState onRetry={() => window.location.reload()} />;

  return (
    <div>
      <PageTitle title="Reports" subtitle="Financial and operational insights, in Ethiopian Birr." />

      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === id ? 'bg-ink-950 text-white' : 'bg-white text-ink-600 hover:bg-ink-100'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      <div key={tab} className="animate-fade-up">
      {tab === 'daily' && <DailyReport bookings={bookings} date={reportDate} setDate={setReportDate} />}
      {tab === 'revenue' && <RevenueReport bookings={bookings} />}
      {tab === 'booking' && <BookingReport bookings={bookings} />}
      {tab === 'occupancy' && <OccupancyReport bookings={bookings} roomCount={roomCount} />}
      </div>
    </div>
  );
}

function ReportActions({ onPrint, title }: { onPrint: () => void; title: string }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="font-serif text-xl font-semibold text-ink-900">{title}</h2>
      <button onClick={onPrint} className="btn-outline print:hidden"><Printer className="h-4 w-4" /> Print</button>
    </div>
  );
}

function DailyReport({ bookings, date, setDate }: { bookings: Booking[]; date: string; setDate: (d: string) => void }) {
  const dayBookings = bookings.filter((b) => b.created_at.startsWith(date));
  const arrivals = bookings.filter((b) => b.check_in === date && b.status !== 'cancelled');
  const departures = bookings.filter((b) => b.check_out === date && b.status !== 'cancelled');
  const inHouse = bookings.filter((b) => b.status === 'checked_in');
  const collectedToday = dayBookings.filter((b) => b.payment_status === 'paid').reduce((s, b) => s + Number(b.total_amount), 0);

  const handlePrint = () => window.print();

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <label className="label-luxe">Report Date</label>
          <input type="date" value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)} className="input-luxe sm:w-52" />
        </div>
        <button onClick={handlePrint} className="btn-outline self-end print:hidden"><Printer className="h-4 w-4" /> Print Report</button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Bookings Created" value={dayBookings.length} icon={BookOpen} />
        <StatCard label="Arrivals" value={arrivals.length} icon={DoorOpen} />
        <StatCard label="In House" value={inHouse.length} icon={DoorOpen} tone="gold" />
        <StatCard label="Revenue Collected" value={formatEtb(collectedToday)} icon={TrendingUp} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card-luxe p-6">
          <h3 className="font-serif text-lg font-semibold text-ink-900">Arrivals — {formatDate(date)}</h3>
          <div className="mt-4 space-y-3">
            {arrivals.length === 0 ? <p className="py-6 text-center text-sm text-ink-400">No arrivals.</p> : arrivals.map((b) => (
              <div key={b.id} className="flex items-center justify-between border-b border-ink-50 pb-2 last:border-0">
                <div>
                  <p className="text-sm font-medium text-ink-900">{b.customer_name_snapshot ?? 'Guest'}</p>
                  <p className="text-xs text-ink-400">{b.room?.name} · {b.nights}n</p>
                </div>
                <StatusBadge status={b.status} />
              </div>
            ))}
          </div>
        </div>
        <div className="card-luxe p-6">
          <h3 className="font-serif text-lg font-semibold text-ink-900">Departures — {formatDate(date)}</h3>
          <div className="mt-4 space-y-3">
            {departures.length === 0 ? <p className="py-6 text-center text-sm text-ink-400">No departures.</p> : departures.map((b) => (
              <div key={b.id} className="flex items-center justify-between border-b border-ink-50 pb-2 last:border-0">
                <div>
                  <p className="text-sm font-medium text-ink-900">{b.customer_name_snapshot ?? 'Guest'}</p>
                  <p className="text-xs text-ink-400">{b.room?.name}</p>
                </div>
                <StatusBadge status={b.status} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 card-luxe p-6">
        <h3 className="font-serif text-lg font-semibold text-ink-900">Bookings Created on {formatDate(date)}</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-widest text-ink-400">
              <tr><th className="py-2">Guest</th><th className="py-2">Room</th><th className="py-2">Amount</th><th className="py-2">Payment</th></tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {dayBookings.length === 0 ? (
                <tr><td colSpan={4} className="py-6 text-center text-ink-400">No bookings created on this date.</td></tr>
              ) : dayBookings.map((b) => (
                <tr key={b.id}>
                  <td className="py-2.5 text-ink-900">{b.customer_name_snapshot ?? '—'}</td>
                  <td className="py-2.5 text-ink-600">{b.room?.name ?? '—'}</td>
                  <td className="py-2.5 font-medium text-ink-900">{formatEtb(b.total_amount)}</td>
                  <td className="py-2.5"><PaymentBadge status={b.payment_status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function RevenueReport({ bookings }: { bookings: Booking[] }) {
  const monthly = useMemo(() => {
    const map = new Map<string, { revenue: number; count: number; paid: number }>();
    bookings.forEach((b) => {
      const month = b.created_at.slice(0, 7);
      const entry = map.get(month) ?? { revenue: 0, count: 0, paid: 0 };
      entry.revenue += Number(b.total_amount);
      entry.count += 1;
      if (b.payment_status === 'paid') entry.paid += Number(b.total_amount);
      map.set(month, entry);
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0])).slice(-12);
  }, [bookings]);

  const totalRevenue = bookings.filter((b) => b.payment_status === 'paid').reduce((s, b) => s + Number(b.total_amount), 0);
  const totalExpected = bookings.filter((b) => b.status !== 'cancelled').reduce((s, b) => s + Number(b.total_amount), 0);
  const outstanding = totalExpected - totalRevenue;
  const maxRev = Math.max(...monthly.map((m) => m[1].paid), 1);

  return (
    <div>
      <ReportActions title="Revenue Report" onPrint={() => window.print()} />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Collected Revenue" value={formatEtb(totalRevenue)} icon={TrendingUp} tone="gold" />
        <StatCard label="Expected Revenue" value={formatEtb(totalExpected)} icon={BookOpen} />
        <StatCard label="Outstanding" value={formatEtb(outstanding)} icon={Calendar} hint="Unpaid, non-cancelled" />
      </div>

      <div className="mt-6 card-luxe p-6">
        <h3 className="font-serif text-lg font-semibold text-ink-900">Monthly Revenue (Last 12 months)</h3>
        <div className="mt-6 space-y-3">
          {monthly.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink-400">No revenue data yet.</p>
          ) : monthly.map(([month, data]) => (
            <div key={month}>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-ink-700">{formatMonthLabel(month)}</span>
                <span className="font-semibold text-ink-900">{formatEtb(data.paid)}</span>
              </div>
              <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-ink-100">
                <div className="h-full rounded-full bg-gold-400 transition-all duration-700 ease-out" style={{ width: `${(data.paid / maxRev) * 100}%` }} />
              </div>
              <p className="mt-1 text-xs text-ink-400">{data.count} bookings · {formatEtb(data.revenue)} expected</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BookingReport({ bookings }: { bookings: Booking[] }) {
  const byStatus = useMemo(() => {
    const map = new Map<string, number>();
    bookings.forEach((b) => map.set(b.status, (map.get(b.status) ?? 0) + 1));
    return map;
  }, [bookings]);

  const recent = bookings.slice(0, 20);

  return (
    <div>
      <ReportActions title="Booking Report" onPrint={() => window.print()} />
      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {(['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'] as const).map((s) => (
          <StatCard key={s} label={STATUS_LABELS[s]} value={byStatus.get(s) ?? 0} icon={BookOpen} />
        ))}
      </div>

      <div className="mt-6 card-luxe p-6">
        <h3 className="font-serif text-lg font-semibold text-ink-900">Recent Bookings</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-widest text-ink-400">
              <tr><th className="py-2">Guest</th><th className="py-2">Room</th><th className="py-2">Check-in</th><th className="py-2">Nights</th><th className="py-2">Total</th><th className="py-2">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {recent.map((b) => (
                <tr key={b.id}>
                  <td className="py-2.5 text-ink-900">{b.customer_name_snapshot ?? '—'}</td>
                  <td className="py-2.5 text-ink-600">{b.room?.name ?? '—'}</td>
                  <td className="py-2.5 text-ink-600">{formatDate(b.check_in)}</td>
                  <td className="py-2.5 text-ink-600">{b.nights}</td>
                  <td className="py-2.5 font-medium text-ink-900">{formatEtb(b.total_amount)}</td>
                  <td className="py-2.5"><StatusBadge status={b.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function OccupancyReport({ bookings, roomCount }: { bookings: Booking[]; roomCount: number }) {
  const [range, setRange] = useState(7);
  const days = useMemo(() => {
    const today = todayISO();
    return Array.from({ length: range }).map((_, i) => addDays(today, i));
  }, [range]);

  const occupancyByDay = days.map((day) => {
    const occupied = bookings.filter(
      (b) => b.status !== 'cancelled' && b.check_in <= day && b.check_out > day
    ).length;
    return { day, occupied, rate: roomCount > 0 ? Math.round((occupied / roomCount) * 100) : 0 };
  });

  const avgRate = occupancyByDay.length > 0
    ? Math.round(occupancyByDay.reduce((s, d) => s + d.rate, 0) / occupancyByDay.length)
    : 0;
  const maxRate = Math.max(...occupancyByDay.map((d) => d.rate), 1);

  return (
    <div>
      <ReportActions title="Occupancy Report" onPrint={() => window.print()} />
      <div className="mb-4">
        <label className="label-luxe">Forecast Range</label>
        <select value={range} onChange={(e) => setRange(Number(e.target.value))} className="input-luxe sm:w-52">
          <option value={7}>Next 7 days</option>
          <option value={14}>Next 14 days</option>
          <option value={30}>Next 30 days</option>
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Rooms" value={roomCount} icon={DoorOpen} />
        <StatCard label="Avg Occupancy" value={`${avgRate}%`} icon={TrendingUp} tone="gold" hint={`Over ${range} days`} />
        <StatCard label="Peak Occupancy" value={`${Math.max(...occupancyByDay.map((d) => d.rate))}%`} icon={DoorOpen} />
      </div>

      <div className="mt-6 card-luxe p-6">
        <h3 className="font-serif text-lg font-semibold text-ink-900">Daily Occupancy Forecast</h3>
        <div className="mt-6 space-y-3">
          {occupancyByDay.map((d) => (
            <div key={d.day}>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-ink-700">{formatDate(d.day)}</span>
                <span className="text-ink-600">{d.occupied}/{roomCount} rooms · {d.rate}%</span>
              </div>
              <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-ink-100">
                <div className={`h-full rounded-full transition-all ${d.rate >= 80 ? 'bg-emerald-500' : d.rate >= 40 ? 'bg-gold-400' : 'bg-ink-300'}`} style={{ width: `${(d.rate / maxRate) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function formatMonthLabel(month: string): string {
  const [y, m] = month.split('-');
  const date = new Date(Number(y), Number(m) - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}
