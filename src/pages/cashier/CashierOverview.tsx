import { useEffect, useState } from 'react';
import { DoorOpen, LogOut, Wallet, CalendarCheck, ArrowRight, Clock, BedDouble } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { formatEtb, formatDate, todayISO } from '@/lib/format';
import { StatusBadge, PaymentBadge } from '@/components/Badges';
import { StatCard, StatSkeleton, PageTitle, ErrorState } from '@/components/ui';
import type { Booking } from '@/types';

export default function CashierOverview() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ arrivals: 0, departures: 0, inHouse: 0, collectedToday: 0 });
  const [arrivals, setArrivals] = useState<Booking[]>([]);
  const [departures, setDepartures] = useState<Booking[]>([]);

  const [error, setError] = useState(false);

  useEffect(() => {
    (async () => {
      try {
      const today = todayISO();
      const [{ data: arr }, { data: dep }, { data: inHouse }, { data: paidToday }] = await Promise.all([
        supabase.from('bookings').select('*, room:rooms(id,name,category)').eq('check_in', today).neq('status', 'cancelled').order('created_at', { ascending: false }),
        supabase.from('bookings').select('*, room:rooms(id,name,category)').eq('check_out', today).neq('status', 'cancelled').order('created_at', { ascending: false }),
        supabase.from('bookings').select('*, room:rooms(id,name,category)').eq('status', 'checked_in'),
        supabase.from('bookings').select('total_amount').eq('payment_status', 'paid').gte('created_at', `${today}T00:00:00`).lte('created_at', `${today}T23:59:59.999`),
      ]);
      const collectedToday = (paidToday ?? []).reduce((s, b) => s + Number(b.total_amount), 0);
      setStats({ arrivals: arr?.length ?? 0, departures: dep?.length ?? 0, inHouse: inHouse?.length ?? 0, collectedToday });
      setArrivals(arr ?? []);
      setDepartures(dep ?? []);
      } catch { setError(true); }
      setLoading(false);
    })();
  }, []);

  if (loading) return (
    <div>
      <div className="mb-8 skeleton h-8 w-48" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatSkeleton delay={0} /><StatSkeleton delay={80} /><StatSkeleton delay={160} /><StatSkeleton delay={240} />
      </div>
    </div>
  );
  if (error) return <ErrorState onRetry={() => window.location.reload()} />;

  return (
    <div>
      <PageTitle title="Cashier Dashboard" subtitle={`Today's front desk operations — ${formatDate(new Date())}`} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Today's Arrivals" value={stats.arrivals} icon={DoorOpen} tone="gold" delay={0} />
        <StatCard label="Today's Departures" value={stats.departures} icon={LogOut} delay={80} />
        <StatCard label="In House" value={stats.inHouse} icon={BedDouble} delay={160} />
        <StatCard label="Collected Today" value={formatEtb(stats.collectedToday)} icon={Wallet} delay={240} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="card-luxe p-6 animate-fade-up" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-semibold text-ink-900">Today's Arrivals</h2>
            <Link to="/cashier/operations" className="inline-flex items-center gap-1.5 text-sm font-medium text-gold-600 transition-all hover:gap-2.5">
              Manage <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {arrivals.length === 0 ? (
              <div className="py-8 text-center">
                <CalendarCheck className="mx-auto h-8 w-8 text-ink-300" />
                <p className="mt-2 text-sm text-ink-400">No arrivals scheduled today.</p>
              </div>
            ) : arrivals.map((b) => (
              <div key={b.id} className="flex items-center justify-between border-b border-ink-50 pb-3 last:border-0">
                <div>
                  <p className="text-sm font-medium text-ink-900">{b.customer_name_snapshot ?? 'Guest'}</p>
                  <p className="text-xs text-ink-400">{b.room?.name} · {b.nights}n</p>
                </div>
                <div className="flex items-center gap-2">
                  <PaymentBadge status={b.payment_status} />
                  <StatusBadge status={b.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-luxe p-6 animate-fade-up" style={{ animationDelay: '380ms' }}>
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-semibold text-ink-900">Today's Departures</h2>
            <span className="inline-flex items-center gap-1.5 text-xs text-ink-400"><Clock className="h-4 w-4" /> {formatDate(new Date())}</span>
          </div>
          <div className="mt-4 space-y-3">
            {departures.length === 0 ? (
              <div className="py-8 text-center">
                <LogOut className="mx-auto h-8 w-8 text-ink-300" />
                <p className="mt-2 text-sm text-ink-400">No departures scheduled today.</p>
              </div>
            ) : departures.map((b) => (
              <div key={b.id} className="flex items-center justify-between border-b border-ink-50 pb-3 last:border-0">
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
    </div>
  );
}
