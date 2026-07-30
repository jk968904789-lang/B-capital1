import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Shield, AlertCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import Logo from '@/components/Logo';

export default function StaffLoginPage() {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError('Invalid credentials. Please try again.');
      setLoading(false);
      return;
    }

    const metaRole = data.user?.user_metadata?.role as string | undefined;
    if (metaRole !== 'admin' && metaRole !== 'cashier') {
      await supabase.auth.signOut();
      setError('This portal is for staff only. Please use the customer sign-in.');
      setLoading(false);
      return;
    }

    const { data: sp } = await supabase
      .from('staff_profiles')
      .select('role, is_active')
      .eq('id', data.user.id)
      .maybeSingle();

    if (!sp || !sp.is_active) {
      await supabase.auth.signOut();
      setError('This staff account has been disabled. Please contact the administrator.');
      setLoading(false);
      return;
    }

    await refreshProfile();
    navigate(sp.role === 'admin' ? '/admin' : '/cashier');
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink-950 px-6 py-12">
      <div className="absolute inset-0">
        <img
          src="https://images.pexels.com/photos/3926482/pexels-photo-3926482.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt=""
          className="h-full w-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink-950 via-ink-950/85 to-ink-950" />
      </div>

      <div className="relative z-10 w-full max-w-md animate-fade-up">
        <div className="mb-8 text-center">
          <Logo variant="light" className="justify-center" />
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gold-400 text-ink-950">
              <Shield className="h-5 w-5" />
            </span>
            <div>
              <h1 className="font-serif text-2xl font-semibold text-white">Staff Portal</h1>
              <p className="text-sm text-ink-300">Restricted access · Admin & Cashier only</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-red-500/20 bg-red-500/10 p-3.5 text-sm text-red-300 animate-slide-down">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-gold-300" htmlFor="staff-email">Email</label>
              <input
                id="staff-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-ink-400 transition-colors focus:border-gold-400 focus:outline-none focus:ring-1 focus:ring-gold-400"
                placeholder="staff@bcapital.com"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-gold-300" htmlFor="staff-password">Password</label>
              <input
                id="staff-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-ink-400 transition-colors focus:border-gold-400 focus:outline-none focus:ring-1 focus:ring-gold-400"
                placeholder="••••••••"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-gold w-full">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
              Sign In to Portal
            </button>
          </form>
        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-ink-300 transition-colors hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Back to website
          </Link>
        </div>
      </div>
    </div>
  );
}
