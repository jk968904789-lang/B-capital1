import { useEffect, useState } from 'react';
import { Users, Search, Mail, Phone, BookOpen, Eye, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatDate, formatEtb } from '@/lib/format';
import { StatusBadge } from '@/components/Badges';
import { PageTitle, EmptyState, Modal } from '@/components/ui';
import type { Booking } from '@/types';

interface CustomerRow {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  created_at: string;
  booking_count: number;
}

export default function CashierCustomers() {
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [viewingBookings, setViewingBookings] = useState<CustomerRow | null>(null);
  const [customerBookings, setCustomerBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  useEffect(() => {
    (async () => {
      // Fetch customer profiles (cashier can read via RLS — staff can see all customer_profiles
      // through the staff_select policy on bookings, but customer_profiles itself is customer-only).
      // Instead, we derive customers from bookings snapshots which cashiers can fully access.
      const { data: bookings } = await supabase
        .from('bookings')
        .select('customer_id, customer_name_snapshot, customer_email_snapshot, customer_phone_snapshot, created_at')
        .not('customer_email_snapshot', 'is', null)
        .order('created_at', { ascending: false });

      // Deduplicate by email to build a customer directory from booking snapshots.
      const seen = new Map<string, CustomerRow>();
      const counts = new Map<string, number>();
      (bookings ?? []).forEach((b) => {
        const email = b.customer_email_snapshot ?? '';
        if (!email) return;
        counts.set(email, (counts.get(email) ?? 0) + 1);
        if (!seen.has(email)) {
          seen.set(email, {
            id: b.customer_id ?? email,
            email,
            full_name: b.customer_name_snapshot ?? 'Unknown',
            phone: b.customer_phone_snapshot,
            created_at: b.created_at,
            booking_count: 0,
          });
        }
      });
      const list = Array.from(seen.values()).map((c) => ({ ...c, booking_count: counts.get(c.email) ?? 0 }));
      setCustomers(list);
      setLoading(false);
    })();
  }, []);

  const handleViewBookings = async (customer: CustomerRow) => {
    setViewingBookings(customer);
    setLoadingBookings(true);
    const { data } = await supabase
      .from('bookings')
      .select('*, room:rooms(id, name, category)')
      .eq('customer_email_snapshot', customer.email)
      .order('created_at', { ascending: false });
    setCustomerBookings(data ?? []);
    setLoadingBookings(false);
  };

  const filtered = customers.filter((c) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      c.email.toLowerCase().includes(q) ||
      c.full_name.toLowerCase().includes(q) ||
      (c.phone ?? '').toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <PageTitle title="Customer Search" subtitle="Search for guests by name, email, or phone and view their booking history." />

      <div className="mb-6 relative sm:max-w-md animate-fade-in">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, email, or phone…"
          className="input-luxe pl-10"
        />
      </div>

      {loading ? (
        <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white">
          <div className="divide-y divide-ink-50">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-5 animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="skeleton h-10 w-10 rounded-full" />
                <div className="flex-1"><div className="skeleton h-4 w-32" /><div className="skeleton mt-2 h-3 w-48" /></div>
                <div className="skeleton h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Users} title="No customers found" message="Guests will appear here after their first booking." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-ink-50 text-left text-xs uppercase tracking-widest text-ink-500">
                <tr>
                  <th className="px-5 py-3">Guest</th>
                  <th className="px-5 py-3">Contact</th>
                  <th className="px-5 py-3">Bookings</th>
                  <th className="px-5 py-3 text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {filtered.map((c, i) => (
                  <tr key={c.id} className="table-row-hover animate-fade-in" style={{ animationDelay: `${i * 30}ms` }}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-50 text-sm font-semibold text-gold-700">{getInitials(c.full_name)}</span>
                        <span className="font-medium text-ink-900">{c.full_name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <p className="flex items-center gap-1.5 text-ink-700"><Mail className="h-3.5 w-3.5 text-ink-400" /> {c.email}</p>
                      {c.phone && <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-400"><Phone className="h-3 w-3" /> {c.phone}</p>}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="rounded-full bg-gold-50 px-2.5 py-1 text-xs font-semibold text-gold-700">{c.booking_count}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => handleViewBookings(c)}
                        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-ink-500 transition-all hover:bg-gold-50 hover:text-gold-600"
                      >
                        <Eye className="h-3.5 w-3.5" /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {viewingBookings && (
        <Modal open={true} onClose={() => setViewingBookings(null)} title={`Bookings — ${viewingBookings.full_name}`} size="lg">
          {loadingBookings ? (
            <div className="flex items-center justify-center py-12">
              <div className="relative">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold-200" />
                <div className="absolute inset-0 h-8 w-8 animate-spin rounded-full border-2 border-transparent border-t-gold-500" />
              </div>
            </div>
          ) : customerBookings.length === 0 ? (
            <div className="py-8 text-center">
              <BookOpen className="mx-auto h-8 w-8 text-ink-300" />
              <p className="mt-3 text-sm text-ink-400">No bookings found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {customerBookings.map((b, i) => (
                <div key={b.id} className="flex items-center justify-between rounded-lg border border-ink-100 p-4 animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
                  <div>
                    <p className="font-medium text-ink-900">{b.room?.name ?? '—'}</p>
                    <p className="text-xs text-ink-500">{formatDate(b.check_in)} → {formatDate(b.check_out)} · {b.nights}n</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={b.status} />
                    <span className="font-semibold text-ink-900">{formatEtb(b.total_amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-6 flex justify-end border-t border-ink-100 pt-5">
            <button onClick={() => setViewingBookings(null)} className="btn-outline"><X className="h-4 w-4" /> Close</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function getInitials(name: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? '?';
  return (parts[0][0] ?? '') + (parts[parts.length - 1][0] ?? '');
}
