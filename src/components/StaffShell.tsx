import { useEffect, useState, type ReactNode } from 'react';
import { Link, NavLink, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, LogOut, Crown, Shield, Menu, X,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import type { StaffRole } from '@/types';
import Logo from '@/components/Logo';

interface StaffShellProps {
  requiredRole: StaffRole;
  navItems: { to: string; label: string; icon: typeof LayoutDashboard; end?: boolean }[];
}

export default function StaffShell({ requiredRole, navItems }: StaffShellProps) {
  const { user, role, loading, signOut, fullName } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) navigate('/staff-login', { replace: true });
      else if (!role) navigate('/staff-login', { replace: true });
      else if (role === 'customer') navigate('/account', { replace: true });
      else if (role !== requiredRole) navigate(role === 'admin' ? '/admin' : '/cashier', { replace: true });
    }
  }, [user, role, loading, requiredRole, navigate]);

  const roleOk = role === requiredRole;
  if (loading || !user || !roleOk) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-50">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-gold-200" />
            <div className="absolute inset-0 h-10 w-10 animate-spin rounded-full border-2 border-transparent border-t-gold-500" />
          </div>
          <p className="text-sm text-ink-400">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  const roleLabel = role === 'admin' ? 'Administrator' : 'Cashier';

  const handleSignOut = async () => {
    await signOut();
    navigate('/staff-login');
  };

  const SidebarContent: ReactNode = (
    <>
      <div className="px-4 py-5">
        <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3.5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-400 text-ink-950">
            <Shield className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{fullName || user.email}</p>
            <p className="text-[10px] uppercase tracking-widest text-gold-300">{roleLabel}</p>
          </div>
        </div>
      </div>
      <nav className="space-y-1 px-4 pb-4">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gold-400 text-ink-950 shadow-lg shadow-gold-500/20'
                  : 'text-ink-200 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto border-t border-white/10 p-4">
        <Link to="/" className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-ink-300 transition-colors hover:text-white">
          <Crown className="h-4 w-4" /> View website
        </Link>
        <button
          onClick={handleSignOut}
          className="mt-1 flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-ink-300 transition-colors hover:bg-white/5 hover:text-white"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-ink-50 lg:flex">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-ink-950 text-white lg:flex">
        <div className="flex h-16 items-center border-b border-white/10 px-5">
          <Logo variant="light" />
        </div>
        <div className="flex flex-1 flex-col">{SidebarContent}</div>
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 z-30 bg-ink-950/50 lg:hidden animate-fade-in" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-ink-950 text-white lg:hidden animate-slide-right">
            <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
              <Logo variant="light" />
              <button onClick={() => setSidebarOpen(false)} className="text-white" aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-1 flex-col">{SidebarContent}</div>
          </aside>
        </>
      )}

      {/* Main */}
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-ink-100 bg-white/95 px-5 backdrop-blur-sm lg:px-8 print:hidden">
          <button className="text-ink-700 lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <Menu className="h-6 w-6" />
          </button>
          <p className="hidden text-sm font-medium text-ink-500 lg:block">
            B Capital · {roleLabel} Dashboard
          </p>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-ink-500 sm:inline">{fullName || user.email}</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-50 text-gold-600">
              <Shield className="h-4 w-4" />
            </span>
          </div>
        </header>
        <div className="flex-1 p-5 lg:p-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
