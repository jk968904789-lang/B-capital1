import { useEffect, useState } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { Toast } from '@/components/ui';

export default function ProfilePage() {
  const { user, fullName, refreshProfile } = useAuth();
  const [name, setName] = useState(fullName || '');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (!user) return;
    supabase
      .from('customer_profiles')
      .select('full_name, phone')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setName(data.full_name || '');
          setPhone(data.phone || '');
        }
        setLoading(false);
      });
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from('customer_profiles')
      .update({ full_name: name, phone })
      .eq('id', user.id);
    setSaving(false);
    if (error) {
      showToast('Could not save changes. Please try again.', 'error');
    } else {
      await refreshProfile();
      showToast('Profile updated successfully.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="relative">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-gold-200" />
          <div className="absolute inset-0 h-10 w-10 animate-spin rounded-full border-2 border-transparent border-t-gold-500" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 animate-slide-right">
        <h1 className="font-serif text-2xl font-semibold text-ink-900 sm:text-3xl">Profile</h1>
        <p className="mt-1.5 text-sm text-ink-500">Update your personal information.</p>
      </div>

      <form onSubmit={handleSave} className="card-luxe max-w-2xl p-8">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="label-luxe" htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-luxe"
              placeholder="Your full name"
            />
          </div>
          <div>
            <label className="label-luxe" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={user?.email || ''}
              disabled
              className="input-luxe cursor-not-allowed bg-ink-50 text-ink-400"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label-luxe" htmlFor="phone">Phone Number</label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input-luxe"
              placeholder="+251 ..."
            />
          </div>
        </div>
        <div className="mt-8 flex justify-end border-t border-ink-100 pt-6">
          <button type="submit" disabled={saving} className="btn-gold">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>

      {toast && <Toast message={toast.msg} type={toast.type} />}
    </div>
  );
}
