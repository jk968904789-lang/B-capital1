import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, UserPlus, Crown, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import Logo from '@/components/Logo';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.fullName, role: 'customer' } },
    });
    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }
    if (data.user) {
      const { error: profileErr } = await supabase.from('customer_profiles').upsert({
        id: data.user.id,
        email: form.email,
        full_name: form.fullName,
        phone: form.phone || null,
      });
      if (profileErr) {
        setError('Account created, but we could not save your profile. Please try updating it from your account.');
        setLoading(false);
        navigate('/account');
        return;
      }
    }
    await refreshProfile();
    navigate('/account');
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <img
          src="https://images.pexels.com/photos/8082217/pexels-photo-8082217.jpeg?auto=compress&cs=tinysrgb&w=1200"
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/40 to-ink-950/60" />
        <div className="absolute bottom-0 left-0 right-0 p-12 text-white">
          <Logo variant="light" />
          <h2 className="mt-6 max-w-md font-serif text-4xl font-medium leading-tight animate-fade-up">
            Begin your journey with B Capital
          </h2>
        </div>
      </div>

      <div className="flex items-center justify-center bg-ink-50 px-6 py-12">
        <div className="w-full max-w-md animate-fade-up">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <div className="card-luxe p-8">
            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ink-950 text-gold-400">
                <UserPlus className="h-5 w-5" />
              </span>
              <div>
                <h1 className="font-serif text-2xl font-semibold text-ink-900">Create account</h1>
                <p className="text-sm text-ink-500">Join B Capital to book your stay</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3.5 text-sm text-red-700 animate-slide-down">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label-luxe" htmlFor="fullName">Full name</label>
                <input id="fullName" required value={form.fullName} onChange={update('fullName')} className="input-luxe" placeholder="Your full name" />
              </div>
              <div>
                <label className="label-luxe" htmlFor="email">Email</label>
                <input id="email" type="email" required value={form.email} onChange={update('email')} className="input-luxe" placeholder="you@email.com" />
              </div>
              <div>
                <label className="label-luxe" htmlFor="phone">Phone (optional)</label>
                <input id="phone" value={form.phone} onChange={update('phone')} className="input-luxe" placeholder="+251 ..." />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label-luxe" htmlFor="password">Password</label>
                  <input id="password" type="password" required value={form.password} onChange={update('password')} className="input-luxe" placeholder="At least 8 chars" />
                </div>
                <div>
                  <label className="label-luxe" htmlFor="confirm">Confirm</label>
                  <input id="confirm" type="password" required value={form.confirm} onChange={update('confirm')} className="input-luxe" placeholder="Repeat password" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-gold w-full">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                Create Account
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-ink-500">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-gold-600 hover:text-gold-700">
                Sign in
              </Link>
            </p>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-ink-400">
            <Crown className="h-3.5 w-3.5 text-gold-500" />
            <span>B Capital · Dire Dawa</span>
          </div>
        </div>
      </div>
    </div>
  );
}
