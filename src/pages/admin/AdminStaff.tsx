import { useEffect, useState } from 'react';
import { Plus, Shield, Loader2, Power, Trash2, Search, UserCog } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import type { StaffProfile } from '@/types';
import { formatDate } from '@/lib/format';
import { PageTitle, EmptyState, Modal, ConfirmDialog, Toast } from '@/components/ui';

const EDGE_URL = `${(import.meta.env.VITE_SUPABASE_URL as string).replace(/\/$/, '')}/functions/v1/staff-admin`;

export default function AdminStaff() {
  const { session } = useAuth();
  const [staff, setStaff] = useState<StaffProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ full_name: '', email: '', password: '' });
  const [saving, setSaving] = useState(false);
  const [toggleTarget, setToggleTarget] = useState<StaffProfile | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StaffProfile | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(EDGE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ action: 'list_staff' }),
      });
      const data = await res.json();
      setStaff(data.staff ?? []);
    } catch {
      showToast('Could not load staff list. Please try again.', 'error');
    }
    setLoading(false);
  };

  useEffect(() => { if (session) load(); }, [session]);

  const handleCreate = async () => {
    if (!form.full_name || !form.email || !form.password) {
      showToast('All fields are required.', 'error');
      return;
    }
    if (form.password.length < 8) {
      showToast('Password must be at least 8 characters.', 'error');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(EDGE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ action: 'create_cashier', email: form.email, password: form.password, full_name: form.full_name, role: 'cashier' }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error ?? 'Could not create cashier.', 'error');
        setSaving(false);
        return;
      }
      showToast('Cashier account created successfully.');
      setForm({ full_name: '', email: '', password: '' });
      setShowCreate(false);
      load();
    } catch {
      showToast('Network error. Could not create cashier.', 'error');
    }
    setSaving(false);
  };

  const handleToggle = async () => {
    if (!toggleTarget) return;
    try {
      const res = await fetch(EDGE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ action: 'toggle_active', staff_id: toggleTarget.id, is_active: !toggleTarget.is_active }),
      });
      if (res.ok) {
        showToast(toggleTarget.is_active ? 'Staff account disabled.' : 'Staff account enabled.');
        load();
      } else {
        showToast('Could not update staff status.', 'error');
      }
    } catch {
      showToast('Network error. Could not update staff status.', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(EDGE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ action: 'delete_staff', staff_id: deleteTarget.id }),
      });
      if (res.ok) {
        showToast('Staff account deleted.');
        load();
      } else {
        const data = await res.json();
        showToast(data.error ?? 'Could not delete staff account.', 'error');
      }
    } catch {
      showToast('Network error. Could not delete staff account.', 'error');
    }
  };

  const filtered = staff.filter((s) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return s.email.toLowerCase().includes(q) || s.full_name.toLowerCase().includes(q);
  });

  return (
    <div>
      <PageTitle
        title="Staff Management"
        subtitle="Create cashier accounts and manage staff access."
        action={<button onClick={() => setShowCreate(true)} className="btn-gold"><Plus className="h-4 w-4" /> Add Cashier</button>}
      />

      <div className="mb-6 relative sm:max-w-md animate-fade-in">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search staff…" className="input-luxe pl-10" />
      </div>

      {loading ? (
        <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white">
          <div className="divide-y divide-ink-50">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-5 animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="skeleton h-10 w-10 rounded-full" />
                <div className="flex-1"><div className="skeleton h-4 w-32" /><div className="skeleton mt-2 h-3 w-48" /></div>
                <div className="skeleton h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={UserCog} title="No staff found" message="Add a cashier to give them dashboard access." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white">
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-ink-50 text-left text-xs uppercase tracking-widest text-ink-500">
              <tr>
                <th className="px-5 py-3">Staff Member</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Joined</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {filtered.map((s, i) => (
                <tr key={s.id} className="table-row-hover animate-fade-in" style={{ animationDelay: `${i * 30}ms` }}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className={`flex h-9 w-9 items-center justify-center rounded-full ${s.role === 'admin' ? 'bg-gold-400 text-ink-950' : 'bg-ink-100 text-ink-600'}`}>
                        <Shield className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="font-medium text-ink-900">{s.full_name}</p>
                        <p className="text-xs text-ink-400">{s.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                      s.role === 'admin' ? 'bg-gold-50 text-gold-700' : 'bg-blue-50 text-blue-700'
                    }`}>
                      {s.role}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                      s.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
                    }`}>
                      {s.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-ink-600">{formatDate(s.created_at)}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      {s.role !== 'admin' && (
                        <>
                          <button onClick={() => setToggleTarget(s)} className="rounded-lg p-2 text-ink-500 hover:bg-amber-50 hover:text-amber-600" aria-label="Toggle active">
                            <Power className="h-4 w-4" />
                          </button>
                          <button onClick={() => setDeleteTarget(s)} className="rounded-lg p-2 text-ink-500 hover:bg-red-50 hover:text-red-600" aria-label="Delete">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Add Cashier Account">
        <div className="space-y-4">
          <p className="text-sm text-ink-500">Create a new cashier account. The cashier will sign in through the staff portal at <span className="font-semibold text-ink-700">/staff-login</span>.</p>
          <div>
            <label className="label-luxe">Full Name</label>
            <input value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} className="input-luxe" placeholder="Cashier name" />
          </div>
          <div>
            <label className="label-luxe">Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="input-luxe" placeholder="cashier@bcapital.com" />
          </div>
          <div>
            <label className="label-luxe">Password</label>
            <input type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} className="input-luxe" placeholder="At least 8 characters" />
            <p className="mt-1.5 text-xs text-ink-400">The cashier can change this after first login.</p>
          </div>
          <div className="flex justify-end gap-3 border-t border-ink-100 pt-5">
            <button onClick={() => setShowCreate(false)} className="btn-outline">Cancel</button>
            <button onClick={handleCreate} disabled={saving} className="btn-gold">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Create Cashier
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!toggleTarget}
        onClose={() => setToggleTarget(null)}
        onConfirm={handleToggle}
        title={toggleTarget?.is_active ? 'Disable Staff Account' : 'Enable Staff Account'}
        message={toggleTarget?.is_active
          ? `Disable ${toggleTarget?.full_name}? They will no longer be able to sign in.`
          : `Re-enable ${toggleTarget?.full_name}? They will be able to sign in again.`}
        confirmLabel={toggleTarget?.is_active ? 'Disable' : 'Enable'}
        tone={toggleTarget?.is_active ? 'danger' : 'default'}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Staff Account"
        message={`Permanently delete ${deleteTarget?.full_name}? This cannot be undone.`}
        confirmLabel="Delete"
        tone="danger"
      />

      {toast && <Toast message={toast.msg} type={toast.type} />}
    </div>
  );
}
