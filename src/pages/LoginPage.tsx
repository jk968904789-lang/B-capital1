import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Loader2, LogIn, Crown, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import Logo from '@/components/Logo';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshProfile } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const from = (location.state as { from?: string } | null)?.from ?? '/account';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }
    // refreshProfile now re-reads the session from Supabase and resolves role
    // against staff_profiles.is_active — so it's accurate even right after login.
    await refreshProfile();
    const { data: userData } = await supabase.auth.getUser();
    const metaRole = userData.user?.user_metadata?.role;
    if (metaRole === 'admin' || metaRole === 'cashier') {
      // Verify against staff_profiles to block disabled accounts from the customer login.
      const { data: sp } = await supabase
        .from('staff_profiles')
        .select('is_active')
        .eq('id', userData.user!.id)
        .maybeSingle();
      if (!sp || !sp.is_active) {
        await supabase.auth.signOut();
        setError('This account has been disabled. Please contact the administrator.');
        setLoading(false);
        return;
      }
      navigate(metaRole === 'admin' ? '/admin' : '/cashier');
    } else {
      navigate(from);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <img
          src="https://images.pexels.com/photos/14022458/pexels-photo-14022458.jpeg?auto=compress&cs=tinysrgb&w=1200"
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/40 to-ink-950/60" />
        <div className="absolute bottom-0 left-0 right-0 p-12 text-white">
          <Logo variant="light" />
          <h2 className="mt-6 max-w-md font-serif text-4xl font-medium leading-tight animate-fade-up">
            Welcome back to a stay defined by quiet luxury
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
                <LogIn className="h-5 w-5" />
              </span>
              <div>
                <h1 className="font-serif text-2xl font-semibold text-ink-900">Sign in</h1>
                <p className="text-sm text-ink-500">Access your account and bookings</p>
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
                <label className="label-luxe" htmlFor="email">Email</label>
                <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-luxe" placeholder="you@email.com" />
              </div>
              <div>
                <label className="label-luxe" htmlFor="password">Password</label>
                <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input-luxe" placeholder="••••••••" />
              </div>
              <button type="submit" disabled={loading} className="btn-gold w-full">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
                Sign In
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-ink-500">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-gold-600 hover:text-gold-700">
                Create one
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
