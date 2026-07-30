import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import type { StaffRole } from '../types';

type AppRole = 'customer' | 'admin' | 'cashier';

interface AuthState {
  session: Session | null;
  user: User | null;
  role: AppRole | null;
  fullName: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const resolveProfile = async (user: User | null) => {
    if (!user) {
      setRole(null);
      setFullName(null);
      return;
    }
    const metaRole = user.user_metadata?.role as string | undefined;
    if (metaRole === 'admin' || metaRole === 'cashier') {
      // Always verify against staff_profiles — never trust metadata alone.
      const { data: sp } = await supabase
        .from('staff_profiles')
        .select('role, is_active, full_name')
        .eq('id', user.id)
        .maybeSingle();
      if (sp && sp.is_active) {
        setRole(sp.role as StaffRole);
        setFullName(sp.full_name);
        return;
      }
      // Metadata says staff but no active staff_profiles row — fall through to
      // customer check instead of locking the user out entirely.
    }
    const { data: cp } = await supabase
      .from('customer_profiles')
      .select('full_name')
      .eq('id', user.id)
      .maybeSingle();
    setRole('customer');
    setFullName(cp?.full_name ?? (user.user_metadata?.full_name ?? null));
  };

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      resolveProfile(data.session?.user ?? null).finally(() => mounted && setLoading(false));
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!mounted) return;
      setSession(newSession);
      (async () => {
        await resolveProfile(newSession?.user ?? null);
      })();
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setRole(null);
    setFullName(null);
  };

  // Refresh profile from the live session (re-reads user from Supabase to avoid
  // stale closure state right after signInWithPassword).
  const refreshProfile = async () => {
    const { data } = await supabase.auth.getSession();
    setSession(data.session);
    await resolveProfile(data.session?.user ?? null);
  };

  const value = useMemo<AuthState>(
    () => ({
      session,
      user: session?.user ?? null,
      role,
      fullName,
      loading,
      signOut,
      refreshProfile,
    }),
    [session, role, fullName, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
