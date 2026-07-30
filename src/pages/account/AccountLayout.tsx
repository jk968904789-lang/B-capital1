import { type ReactNode } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CalendarCheck, User as UserIcon, LogOut, Crown, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import Logo from '@/components/Logo';

const navItems = [
  { to: '/account', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/account/bookings', label: 'My Bookings', icon: CalendarCheck, end: false },
  { to: '/account/profile', label: 'Profile', icon: UserIcon, end: false },
];

export default function AccountLayout() {
  const { user, role, loading, signOut, fullName } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) navigate('/login', { replace: true });
      else if (role === 'admin') navigate('/admin', { replace: true });
      else if (role === 'cashier') navigate('/cashier', { replace: true });
    }
  }, [user, role, loading, navigate]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-50">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-gold-200" />
            <div className="absolute inset-0 h-10 w-10 animate-spin rounded-full border-2 border-transparent border-t-gold-500" />
          </div>
          <p className="text-sm text-ink-400">Loading your account…</p>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const SidebarContent: ReactNode = (
    <>
      <div className="px-4 py-5">
        <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3.5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-400 text-ink-950">
            <Crown className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{fullName || 'Guest'}</p>
            <p className="text-[10px] uppercase tracking-widest text-gold-300">Member</p>
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
        <button onClick={handleSignOut} className="mt-1 flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-ink-300 transition-colors hover:bg-white/5 hover:text-white">
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
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-ink-100 bg-white/95 px-5 backdrop-blur-sm lg:px-8">
          <button className="text-ink-700 lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <Menu className="h-6 w-6" />
          </button>
          <p className="hidden text-sm font-medium text-ink-500 lg:block">
            B Capital · My Account
          </p>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-ink-500 sm:inline">{fullName || user.email}</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-50 text-gold-600">
              <Crown className="h-4 w-4" />
            </span>
          </div>
        </header>
        <div className="flex-1 p-5 lg:p-8">
          <div className="mx-auto max-w-5xl">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
