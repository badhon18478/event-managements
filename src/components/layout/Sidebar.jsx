'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  CreditCard,
  Settings,
  LogOut,
  PlusCircle,
  X,
  Home,
  ChevronRight,
} from 'lucide-react';
// import { useAuth } from '@/AuthContext/AuthProvider';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../AuthContext/AuthProvider';
export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const { user, logOut } = useAuth();

  const handleLogout = async () => {
    try {
      await logOut();
      toast.success('Logged out successfully');
      onClose?.();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/events', label: 'My Events', icon: Calendar },
    { href: '/add-event', label: 'Add Event', icon: PlusCircle },
    { href: '/dashboard/payments', label: 'Payments', icon: CreditCard },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
    { href: '/', label: 'Back to Home', icon: Home },
  ];

  const avatarLetter =
    user?.displayName?.[0] || user?.email?.[0]?.toUpperCase() || 'U';

  return (
    <>
      {/* ── Dark backdrop — mobile only ── */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`
          fixed inset-0 z-40 bg-black/50
          transition-opacity duration-300
          md:hidden
          ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
      />

      {/* ── Drawer / Sidebar ── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          w-64 flex flex-col
          bg-white border-r border-gray-100
          transition-transform duration-300 ease-in-out
          md:static md:translate-x-0 md:h-screen md:sticky md:top-0
          ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
        `}
      >
        {/* ── Logo row ── */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-gray-100 flex-shrink-0">
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-2.5"
          >
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-white font-extrabold text-sm shadow">
              E
            </span>
            <span className="text-lg font-extrabold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent tracking-tight">
              EventHub
            </span>
          </Link>

          {/* Close — mobile only */}
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── User card ── */}
        <div className="mx-3 my-3 p-3 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center shadow">
                <span className="text-white font-bold text-sm">
                  {avatarLetter}
                </span>
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-white rounded-full" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate leading-tight">
                {user?.displayName || 'User'}
              </p>
              <p className="text-xs text-gray-400 truncate leading-tight">
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* ── Nav items ── */}
        <nav className="flex-1 px-3 py-1 space-y-0.5 overflow-y-auto">
          <p className="px-2 pb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
            Menu
          </p>
          {menuItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-150 group
                  ${
                    active
                      ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md shadow-purple-200'
                      : 'text-gray-600 hover:bg-purple-50 hover:text-purple-700'
                  }
                `}
              >
                <Icon
                  className={`w-[18px] h-[18px] flex-shrink-0 transition-transform group-hover:scale-110 ${
                    active ? 'text-white' : ''
                  }`}
                />
                <span className="flex-1">{label}</span>
                {active && <ChevronRight className="w-3.5 h-3.5 opacity-75" />}
              </Link>
            );
          })}
        </nav>

        {/* ── Sign out ── */}
        <div className="p-3 border-t border-gray-100 flex-shrink-0">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all duration-150 group"
          >
            <LogOut className="w-[18px] h-[18px] group-hover:translate-x-0.5 transition-transform" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
