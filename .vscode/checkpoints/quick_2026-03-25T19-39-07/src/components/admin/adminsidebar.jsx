'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/AuthContext/AuthProvider';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Calendar,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  Shield,
  Bell,
  TrendingUp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function AdminSidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logOut } = useAuth();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = async () => {
    try {
      await logOut();
      toast.success('Logged out successfully');
      onClose();
      router.push('/login');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const mainMenuItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/events', label: 'Events', icon: Calendar },
    { href: '/admin/payments', label: 'Payments', icon: CreditCard },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const secondaryMenuItems = [
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  const isActive = path => {
    if (path === '/admin' && pathname === '/admin') return true;
    if (path !== '/admin' && pathname.startsWith(path)) return true;
    return false;
  };

  const sidebarVariants = {
    open: {
      x: 0,
      transition: { type: 'spring', stiffness: 300, damping: 30 },
    },
    closed: {
      x: '-100%',
      transition: { type: 'spring', stiffness: 300, damping: 30 },
    },
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={isOpen ? 'open' : 'closed'}
        variants={sidebarVariants}
        className={`
          fixed left-0 top-0 z-50 h-full w-80 bg-gradient-to-b from-gray-900 to-gray-800 shadow-2xl
          md:static md:translate-x-0
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <Link
                href="/admin"
                className="flex items-center gap-2 group"
                onClick={onClose}
              >
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-white font-bold text-xl">E</span>
                </div>
                <div>
                  <span className="text-xl font-bold text-white">EventHub</span>
                  <span className="block text-xs text-purple-400">
                    Admin Panel
                  </span>
                </div>
              </Link>
              {isMobile && (
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              )}
            </div>
          </div>

          {/* Admin Badge */}
          <div className="mx-4 mt-4 p-3 bg-purple-600/20 rounded-xl border border-purple-500/30">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-medium text-purple-300">
                Administrator Access
              </span>
            </div>
          </div>

          {/* User Info */}
          <div className="p-4 mx-3 mt-3 bg-gray-800/50 rounded-2xl border border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-lg">
                  {user?.displayName?.[0] ||
                    user?.email?.[0]?.toUpperCase() ||
                    'A'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white truncate">
                  {user?.displayName || user?.email?.split('@')[0] || 'Admin'}
                </p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-400">Admin Online</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            <div className="mb-2 px-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Main Menu
              </p>
            </div>

            {mainMenuItems.map(item => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => isMobile && onClose()}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                    ${
                      active
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }
                  `}
                >
                  <Icon
                    className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-500 group-hover:text-purple-400'}`}
                  />
                  <span className="font-medium text-sm">{item.label}</span>
                  {active && (
                    <motion.div
                      layoutId="adminActiveIndicator"
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-white"
                    />
                  )}
                </Link>
              );
            })}

            <div className="mt-4 mb-2 pt-2 border-t border-gray-700">
              <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Settings
              </p>
            </div>

            {secondaryMenuItems.map(item => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => isMobile && onClose()}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                    ${
                      active
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }
                  `}
                >
                  <Icon
                    className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-500 group-hover:text-purple-400'}`}
                  />
                  <span className="font-medium text-sm">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Bottom Section */}
          <div className="p-3 border-t border-gray-700">
            <Link
              href="/"
              onClick={() => isMobile && onClose()}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-gray-800 hover:text-white transition-all group"
            >
              <Home className="w-5 h-5 text-gray-500 group-hover:text-purple-400" />
              <span className="font-medium text-sm">Back to Site</span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all group mt-1"
            >
              <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span className="font-medium text-sm">Sign Out</span>
            </button>
          </div>

          {/* Version */}
          <div className="p-4 text-center border-t border-gray-700">
            <p className="text-xs text-gray-500">EventHub Admin v1.0.0</p>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
