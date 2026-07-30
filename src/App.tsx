import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/auth';
import ScrollToTop from '@/components/ScrollToTop';
import PublicLayout from '@/components/PublicLayout';
import StaffShell from '@/components/StaffShell';

// Public pages
import HomePage from '@/pages/HomePage';
import RoomsPage from '@/pages/RoomsPage';
import RoomDetailsPage from '@/pages/RoomDetailsPage';
import GalleryPage from '@/pages/GalleryPage';
import AboutPage from '@/pages/AboutPage';
import FaqPage from '@/pages/FaqPage';
import ContactPage from '@/pages/ContactPage';

// Auth pages
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import StaffLoginPage from '@/pages/StaffLoginPage';
import NotFoundPage from '@/pages/NotFoundPage';

// Customer account
import AccountLayout from '@/pages/account/AccountLayout';
import AccountOverview from '@/pages/account/AccountOverview';
import MyBookings from '@/pages/account/MyBookings';
import ProfilePage from '@/pages/account/ProfilePage';

// Admin
import AdminOverview from '@/pages/admin/AdminOverview';
import AdminRooms from '@/pages/admin/AdminRooms';
import AdminBookings from '@/pages/admin/AdminBookings';
import AdminCustomers from '@/pages/admin/AdminCustomers';
import AdminStaff from '@/pages/admin/AdminStaff';
import AdminReports from '@/pages/admin/AdminReports';
import AdminSettings from '@/pages/admin/AdminSettings';

// Cashier
import CashierOverview from '@/pages/cashier/CashierOverview';
import CashierOperations from '@/pages/cashier/CashierOperations';
import CashierCustomers from '@/pages/cashier/CashierCustomers';
import CashierDailyReport from '@/pages/cashier/CashierDailyReport';
import CashierZReport from '@/pages/cashier/CashierZReport';

import {
  LayoutDashboard, BedDouble, CalendarCheck, Users, UserCog,
  TrendingUp, Settings, DoorOpen, Calendar, FileText,
} from 'lucide-react';

const adminNav = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/rooms', label: 'Rooms', icon: BedDouble },
  { to: '/admin/bookings', label: 'Bookings', icon: CalendarCheck },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/staff', label: 'Staff', icon: UserCog },
  { to: '/admin/reports', label: 'Reports', icon: TrendingUp },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

const cashierNav = [
  { to: '/cashier', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/cashier/operations', label: 'Operations', icon: DoorOpen },
  { to: '/cashier/customers', label: 'Customers', icon: Users },
  { to: '/cashier/daily-report', label: 'Daily Report', icon: Calendar },
  { to: '/cashier/z-report', label: 'Z Report', icon: FileText },
];

function AppRoutes() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-50">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-gold-200" />
            <div className="absolute inset-0 h-12 w-12 animate-spin rounded-full border-2 border-transparent border-t-gold-500" />
          </div>
          <p className="text-sm text-ink-400">Loading B Capital…</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public website */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/rooms" element={<RoomsPage />} />
        <Route path="/rooms/:id" element={<RoomDetailsPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Route>

      {/* Customer auth */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Staff login — completely separate */}
      <Route path="/staff-login" element={<StaffLoginPage />} />

      {/* Customer account (protected: customers only) */}
      <Route path="/account" element={<AccountLayout />}>
        <Route index element={<AccountOverview />} />
        <Route path="bookings" element={<MyBookings />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Admin dashboard (protected: admin only) */}
      <Route path="/admin" element={<StaffShell requiredRole="admin" navItems={adminNav} />}>
        <Route index element={<AdminOverview />} />
        <Route path="rooms" element={<AdminRooms />} />
        <Route path="bookings" element={<AdminBookings />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="staff" element={<AdminStaff />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* Cashier dashboard (protected: cashier only) */}
      <Route path="/cashier" element={<StaffShell requiredRole="cashier" navItems={cashierNav} />}>
        <Route index element={<CashierOverview />} />
        <Route path="operations" element={<CashierOperations />} />
        <Route path="customers" element={<CashierCustomers />} />
        <Route path="daily-report" element={<CashierDailyReport />} />
        <Route path="z-report" element={<CashierZReport />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
