import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Clock, Wallet, TrendingUp, ArrowRight, CalendarCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import type { Booking } from '@/types';
import { formatEtb, formatDate, todayISO } from '@/lib/format';
import { StatusBadge, PaymentBadge } from '@/components/Badges';
import { StatCard, StatSkeleton, EmptyState } from '@/components/ui';

export default function AccountOverview() {
  const { user, fullName } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

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

  const today = todayISO();
  const upcoming = bookings.filter(
    (b) => (b.status === 'pending' || b.status === 'confirmed') && b.check_in >= today
  );
  const active = bookings.filter((b) => b.status === 'checked_in');
  const totalSpent = bookings
    .filter((b) => b.payment_status === 'paid')
    .reduce((sum, b) => sum + Number(b.total_amount), 0);

  return (
    <div>
      <div className="mb-8 animate-slide-right">
        <h1 className="font-serif text-2xl font-semibold text-ink-900 sm:text-3xl">
          Welcome back, {firstName(fullName) || 'Guest'}
        </h1>
        <p className="mt-1.5 text-sm text-ink-500">Here's an overview of your stays at B Capital.</p>
      </div>

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatSkeleton delay={0} />
          <StatSkeleton delay={80} />
          <StatSkeleton delay={160} />
          <StatSkeleton delay={240} />
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Upcoming Stays" value={upcoming.length} icon={CalendarDays} tone="gold" delay={0} />
          <StatCard label="Active Stays" value={active.length} icon={Clock} tone="accent" delay={80} hint={active.length ? 'Currently checked in' : undefined} />
          <StatCard label="Total Bookings" value={bookings.length} icon={TrendingUp} delay={160} />
          <StatCard label="Total Paid" value={formatEtb(totalSpent)} icon={Wallet} tone="dark" delay={240} />
        </div>
      )}

      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold text-ink-900">Recent bookings</h2>
          {!loading && bookings.length > 0 && (
            <Link to="/account/bookings" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-gold-600 transition-all hover:gap-2.5">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>

        {loading ? (
          <div className="mt-4 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card-luxe p-5 animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="flex items-center gap-4">
                  <div className="skeleton h-10 w-10 rounded-xl" />
                  <div className="flex-1">
                    <div className="skeleton h-4 w-32" />
                    <div className="skeleton mt-2 h-3 w-48" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              icon={CalendarCheck}
              title="No bookings yet"
              message="Start your journey with B Capital by exploring our rooms."
              action={<Link to="/rooms" className="btn-gold">Browse rooms</Link>}
            />
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {bookings.slice(0, 4).map((b, i) => (
              <div
                key={b.id}
                className="card-luxe flex flex-col gap-4 p-5 animate-fade-up sm:flex-row sm:items-center sm:justify-between"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div>
                  <p className="font-serif text-lg font-semibold text-ink-900">{b.room?.name ?? 'Room'}</p>
                  <p className="mt-1 text-sm text-ink-500">
                    {formatDate(b.check_in)} → {formatDate(b.check_out)} · {b.nights} night{b.nights === 1 ? '' : 's'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={b.status} />
                  <PaymentBadge status={b.payment_status} />
                  <span className="font-serif text-lg font-semibold text-ink-900">{formatEtb(b.total_amount)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function firstName(name: string | null): string {
  if (!name) return '';
  return name.split(' ')[0];
}
