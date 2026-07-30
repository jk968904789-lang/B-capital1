import { useEffect, useState } from 'react';
import { Users, Search, Mail, Phone, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/format';
import { PageTitle, EmptyState, ErrorState } from '@/components/ui';

interface CustomerRow { id: string; email: string; full_name: string; phone: string | null; created_at: string; booking_count?: number }

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [{ data: profiles }, { data: allBookings }] = await Promise.all([
          supabase.from('customer_profiles').select('id, email, full_name, phone, created_at').order('created_at', { ascending: false }),
          supabase.from('bookings').select('customer_id'),
        ]);
        const countMap = new Map<string, number>();
        (allBookings ?? []).forEach((b) => { if (b.customer_id) countMap.set(b.customer_id, (countMap.get(b.customer_id) ?? 0) + 1); });
        setCustomers((profiles ?? []).map((p) => ({ ...p, booking_count: countMap.get(p.id) ?? 0 })));
      } catch { setError(true); }
      setLoading(false);
    })();
  }, []);

  const filtered = customers.filter((c) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return c.email.toLowerCase().includes(q) || (c.full_name ?? '').toLowerCase().includes(q);
  });

  return (
    <div>
      <PageTitle title="Customer Management" subtitle="View registered customers and their booking activity." />
      <div className="mb-6 relative animate-fade-in">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or email…" className="input-luxe pl-10 sm:max-w-md" />
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
      ) : error ? (
        <ErrorState onRetry={() => window.location.reload()} />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Users} title={query ? "No matching customers" : "No customers yet"} message={query ? "Try a different search term." : "Registered customers will appear here."} />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-ink-50 text-left text-xs uppercase tracking-widest text-ink-500">
                <tr><th className="px-5 py-3">Customer</th><th className="px-5 py-3">Contact</th><th className="px-5 py-3">Joined</th><th className="px-5 py-3 text-right">Bookings</th></tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {filtered.map((c, i) => (
                  <tr key={c.id} className="table-row-hover animate-fade-in" style={{ animationDelay: `${i * 30}ms` }}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-50 text-sm font-semibold text-gold-700">{getInitials(c.full_name)}</span>
                        <span className="font-medium text-ink-900">{c.full_name || 'Unnamed'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="flex items-center gap-1.5 text-ink-700"><Mail className="h-3.5 w-3.5 text-ink-400" /> {c.email}</p>
                      {c.phone && <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-400"><Phone className="h-3 w-3" /> {c.phone}</p>}
                    </td>
                    <td className="px-5 py-3.5 text-ink-600"><span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-ink-400" /> {formatDate(c.created_at)}</span></td>
                    <td className="px-5 py-3.5 text-right"><span className="rounded-full bg-gold-50 px-2.5 py-1 text-xs font-semibold text-gold-700">{c.booking_count ?? 0}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
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
