import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Menu, X, LogIn, Calendar, User as UserIcon, Phone, Mail, MapPin, Crown } from 'lucide-react';
import Logo from './Logo';
import { useAuth } from '@/lib/auth';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/rooms', label: 'Rooms' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/about', label: 'About' },
  { to: '/faq', label: 'FAQ' },
  { to: '/contact', label: 'Contact' },
];

export default function PublicLayout() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user, role, fullName } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const isHome = location.pathname === '/';
  const solid = scrolled || !isHome;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          solid ? 'bg-white/95 shadow-sm backdrop-blur-md' : 'bg-transparent'
        }`}
      >
        <div className="container-luxe flex h-20 items-center justify-between">
          <Logo variant={solid ? 'dark' : 'light'} />

          <nav className="hidden items-center gap-8 lg:flex">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `relative text-sm font-medium tracking-wide transition-colors duration-300 after:absolute after:-bottom-1.5 after:left-0 after:h-px after:bg-gold-400 after:transition-all after:duration-300 ${
                    solid
                      ? isActive
                        ? 'text-gold-600 after:w-full'
                        : 'text-ink-700 hover:text-gold-600 after:w-0 hover:after:w-full'
                      : isActive
                        ? 'text-gold-300 after:w-full'
                        : 'text-white/90 hover:text-white after:w-0 hover:after:w-full'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            {user && role === 'customer' ? (
              <Link to="/account" className="btn-gold !px-5 !py-2.5 !text-xs">
                <UserIcon className="h-4 w-4" />
                {firstName(fullName) || 'My Account'}
              </Link>
            ) : user && (role === 'admin' || role === 'cashier') ? (
              <Link to={role === 'admin' ? '/admin' : '/cashier'} className="btn-gold !px-5 !py-2.5 !text-xs">
                <Calendar className="h-4 w-4" />
                Dashboard
              </Link>
            ) : (
              <Link to="/login" className="btn-gold !px-5 !py-2.5 !text-xs">
                <LogIn className="h-4 w-4" />
                Sign In
              </Link>
            )}
          </div>

          <button
            className={`lg:hidden ${solid ? 'text-ink-900' : 'text-white'}`}
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="lg:hidden animate-slide-down border-t border-ink-100 bg-white">
            <div className="container-luxe flex flex-col gap-1 py-4">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    `rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                      isActive ? 'bg-gold-50 text-gold-700' : 'text-ink-700 hover:bg-ink-50'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <div className="mt-2 flex flex-col gap-2 px-1">
                {user && role === 'customer' ? (
                  <Link to="/account" className="btn-gold w-full">
                    <UserIcon className="h-4 w-4" />
                    My Account
                  </Link>
                ) : user && (role === 'admin' || role === 'cashier') ? (
                  <Link to={role === 'admin' ? '/admin' : '/cashier'} className="btn-gold w-full">
                    <Calendar className="h-4 w-4" />
                    Dashboard
                  </Link>
                ) : (
                  <Link to="/login" className="btn-gold w-full">
                    <LogIn className="h-4 w-4" />
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

function firstName(name: string | null): string {
  if (!name) return '';
  return name.split(' ')[0];
}

function Footer() {
  return (
    <footer className="bg-ink-950 text-ink-200">
      <div className="container-luxe py-16">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo variant="light" />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-ink-300">
              Premium hospitality in the heart of Dire Dawa, Ethiopia. Thoughtfully
              designed rooms, refined service, and a stay defined by quiet luxury.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-gold-400">Explore</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-ink-300 transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-gold-400">Contact</h4>
            <ul className="mt-4 space-y-3.5 text-sm text-ink-300">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
                <span>Bole Road, Kebele 04<br />Dire Dawa, Ethiopia</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-gold-500" />
                <a href="tel:+251251112222" className="transition-colors hover:text-white">+251 25 111 2222</a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-gold-500" />
                <a href="mailto:reservations@bcapital.com" className="transition-colors hover:text-white">reservations@bcapital.com</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-ink-800 pt-8 text-xs text-ink-400 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} B Capital. All rights reserved.</p>
          <p className="flex items-center gap-1.5 tracking-widest uppercase">
            <Crown className="h-3.5 w-3.5 text-gold-500" /> Dire Dawa &middot; Ethiopia
          </p>
        </div>
      </div>
    </footer>
  );
}
