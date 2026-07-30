import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { BedDouble, CalendarCheck, Users, Wallet, TrendingUp, ArrowRight, DoorOpen, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRealtimeTable } from '@/lib/useRealtime';
import { formatEtb, formatDate, todayISO } from '@/lib/format';
import { StatusBadge, PaymentBadge } from '@/components/Badges';
import { StatCard, StatSkeleton, PageTitle, ErrorState } from '@/components/ui';
import type { Booking } from '@/types';

export default function AdminOverview() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [stats, setStats] = useState({ totalRooms: 0, availableRooms: 0, totalBookings: 0, activeBookings: 0, customers: 0, revenue: 0, occupancy: 0 });
  const [recent, setRecent] = useState<Booking[]>([]);
  const [arrivals, setArrivals] = useState<Booking[]>([]);

  const load = useCallback(async () => {
    try {
      const today = todayISO();
      const [{ count: rooms }, { count: avail }, { count: bookings }, { count: customers }, { data: allBookings }, { data: paid }, { count: occupied }, { data: todayArrivals }] = await Promise.all([
        supabase.from('rooms').select('*', { count: 'exact', head: true }),
        supabase.from('rooms').select('*', { count: 'exact', head: true }).eq('is_available', true),
        supabase.from('bookings').select('*', { count: 'exact', head: true }).neq('status', 'cancelled'),
        supabase.from('customer_profiles').select('*', { count: 'exact', head: true }),
        supabase.from('bookings').select('*, room:rooms(id,name,category)').order('created_at', { ascending: false }).limit(5),
        supabase.from('bookings').select('total_amount').eq('payment_status', 'paid'),
        supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'checked_in'),
        supabase.from('bookings').select('*, room:rooms(id,name,category)').eq('check_in', today).neq('status', 'cancelled').order('created_at', { ascending: false }),
      ]);
      const revenue = (paid ?? []).reduce((s, b) => s + Number(b.total_amount), 0);
      setStats({ totalRooms: rooms ?? 0, availableRooms: avail ?? 0, totalBookings: bookings ?? 0, activeBookings: occupied ?? 0, customers: customers ?? 0, revenue, occupancy: (rooms ?? 0) > 0 ? Math.round(((occupied ?? 0) / (rooms ?? 1)) * 100) : 0 });
      setRecent(allBookings ?? []);
      setArrivals(todayArrivals ?? []);
    } catch {
      setError(true);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  useRealtimeTable('bookings', load);
  useRealtimeTable('rooms', load);
  useRealtimeTable('customer_profiles', load);

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
      <PageTitle title="Dashboard" subtitle="An overview of your hotel's performance today." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Rooms" value={stats.totalRooms} icon={BedDouble} hint={`${stats.availableRooms} available`} delay={0} />
        <StatCard label="Occupied Now" value={stats.activeBookings} icon={DoorOpen} hint={`${stats.occupancy}% occupancy`} tone="gold" delay={80} />
        <StatCard label="Customers" value={stats.customers} icon={Users} delay={160} />
        <StatCard label="Total Revenue" value={formatEtb(stats.revenue)} icon={Wallet} hint="Paid bookings" delay={240} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="card-luxe p-6 animate-fade-up" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-semibold text-ink-900">Recent Bookings</h2>
            <Link to="/admin/bookings" className="inline-flex items-center gap-1.5 text-sm font-medium text-gold-600 transition-all hover:gap-2.5">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {recent.length === 0 ? <p className="py-8 text-center text-sm text-ink-400">No bookings yet.</p> : recent.map((b) => (
              <div key={b.id} className="flex items-center justify-between border-b border-ink-50 pb-3 last:border-0">
                <div><p className="text-sm font-medium text-ink-900">{b.room?.name ?? 'Room'}</p><p className="text-xs text-ink-500">{b.customer_name_snapshot ?? 'Guest'} · {formatDate(b.check_in)}</p></div>
                <div className="flex items-center gap-2"><StatusBadge status={b.status} /><span className="text-sm font-semibold text-ink-900">{formatEtb(b.total_amount)}</span></div>
              </div>
            ))}
          </div>
        </div>
        <div className="card-luxe p-6 animate-fade-up" style={{ animationDelay: '380ms' }}>
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-semibold text-ink-900">Today's Arrivals</h2>
            <span className="inline-flex items-center gap-1.5 text-xs text-ink-400"><Clock className="h-4 w-4" /> {formatDate(new Date())}</span>
          </div>
          <div className="mt-4 space-y-3">
            {arrivals.length === 0 ? (
              <div className="py-8 text-center"><CalendarCheck className="mx-auto h-8 w-8 text-ink-300" /><p className="mt-2 text-sm text-ink-400">No arrivals scheduled today.</p></div>
            ) : arrivals.map((b) => (
              <div key={b.id} className="flex items-center justify-between border-b border-ink-50 pb-3 last:border-0">
                <div><p className="text-sm font-medium text-ink-900">{b.customer_name_snapshot ?? 'Guest'}</p><p className="text-xs text-ink-500">{b.room?.name ?? 'Room'} · {b.nights} nights</p></div>
                <PaymentBadge status={b.payment_status} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <QuickLink to="/admin/rooms" icon={BedDouble} label="Manage Rooms" delay={0} />
        <QuickLink to="/admin/bookings" icon={CalendarCheck} label="Manage Bookings" delay={80} />
        <QuickLink to="/admin/reports" icon={TrendingUp} label="View Reports" delay={160} />
      </div>
    </div>
  );
}

function QuickLink({ to, icon: Icon, label, delay = 0 }: { to: string; icon: typeof BedDouble; label: string; delay?: number }) {
  return (
    <Link to={to} className="card-luxe-hover group flex items-center gap-4 p-5 animate-fade-up" style={{ animationDelay: `${delay}ms` }}>
      <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-gold-50 text-gold-600 transition-colors group-hover:bg-gold-100">
        <Icon className="h-5 w-5" strokeWidth={1.8} />
      </span>
      <div className="flex-1"><p className="text-sm font-semibold text-ink-900">{label}</p></div>
      <ArrowRight className="h-4 w-4 text-ink-400 transition-transform duration-300 group-hover:translate-x-1" />
    </Link>
  );
}
