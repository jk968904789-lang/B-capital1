import { useEffect, useState } from 'react';
import { Save, Loader2, Building2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Settings } from '@/types';
import { PageTitle, LoadingState, Toast } from '@/components/ui';

export default function AdminSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('settings').select('*').eq('id', 1).maybeSingle();
      if (data) {
        setSettings(data);
      } else {
        // No settings row yet — initialize with defaults so the page is usable.
        const defaults: Settings = {
          id: 1,
          hotel_name: 'B Capital',
          tagline: 'Premium hospitality in Dire Dawa',
          phone: '+251 25 111 2222',
          email: 'reservations@bcapital.com',
          address: 'Bole Road, Kebele 04',
          city: 'Dire Dawa',
          country: 'Ethiopia',
          check_in_time: '14:00',
          check_out_time: '11:00',
          currency: 'ETB',
          updated_at: new Date().toISOString(),
        };
        await supabase.from('settings').upsert(defaults);
        setSettings(defaults);
      }
      setLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    const { error } = await supabase.from('settings').update({
      hotel_name: settings.hotel_name,
      tagline: settings.tagline,
      phone: settings.phone,
      email: settings.email,
      address: settings.address,
      city: settings.city,
      country: settings.country,
      check_in_time: settings.check_in_time,
      check_out_time: settings.check_out_time,
      updated_at: new Date().toISOString(),
    }).eq('id', 1);
    setSaving(false);
    if (error) {
      setToast({ msg: error.message, type: 'error' });
    } else {
      setToast({ msg: 'Settings saved successfully.', type: 'success' });
    }
    setTimeout(() => setToast(null), 2800);
  };

  if (loading || !settings) return <LoadingState label="Loading settings…" />;

  const update = (key: keyof Settings) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setSettings((s) => (s ? { ...s, [key]: e.target.value } : s));

  return (
    <div className="max-w-3xl">
      <PageTitle title="Settings" subtitle="Update your hotel's contact details and policies." />

      <div className="card-luxe p-6 animate-fade-up">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold-50 text-gold-600">
            <Building2 className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-serif text-lg font-semibold text-ink-900">Hotel Information</h3>
            <p className="text-sm text-ink-500">Shown across the customer website.</p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label-luxe">Hotel Name</label>
            <input value={settings.hotel_name} onChange={update('hotel_name')} className="input-luxe" />
          </div>
          <div>
            <label className="label-luxe">Tagline</label>
            <input value={settings.tagline ?? ''} onChange={update('tagline')} className="input-luxe" />
          </div>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 border-t border-ink-100 pt-6">
          <div>
            <label className="label-luxe">Phone</label>
            <input value={settings.phone ?? ''} onChange={update('phone')} className="input-luxe" />
          </div>
          <div>
            <label className="label-luxe">Email</label>
            <input value={settings.email ?? ''} onChange={update('email')} className="input-luxe" />
          </div>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-3 border-t border-ink-100 pt-6">
          <div className="sm:col-span-2">
            <label className="label-luxe">Address</label>
            <input value={settings.address ?? ''} onChange={update('address')} className="input-luxe" />
          </div>
          <div>
            <label className="label-luxe">City</label>
            <input value={settings.city ?? ''} onChange={update('city')} className="input-luxe" />
          </div>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-3 border-t border-ink-100 pt-6">
          <div>
            <label className="label-luxe">Country</label>
            <input value={settings.country ?? ''} onChange={update('country')} className="input-luxe" />
          </div>
          <div>
            <label className="label-luxe">Check-in Time</label>
            <input value={settings.check_in_time} onChange={update('check_in_time')} className="input-luxe" placeholder="14:00" />
          </div>
          <div>
            <label className="label-luxe">Check-out Time</label>
            <input value={settings.check_out_time} onChange={update('check_out_time')} className="input-luxe" placeholder="11:00" />
          </div>
        </div>

        <div className="mt-6 flex justify-end border-t border-ink-100 pt-5">
          <button onClick={handleSave} disabled={saving} className="btn-gold">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </button>
        </div>
      </div>

      {toast && <Toast message={toast.msg} type={toast.type} />}
    </div>
  );
}
