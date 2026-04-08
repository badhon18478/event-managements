'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/AuthContext/AuthProvider';
import Sidebar from '@/components/layout/Sidebar';
import {
  Calendar,
  CreditCard,
  Ticket,
  TrendingUp,
  PlusCircle,
  ArrowRight,
  Menu,
  Bell,
  Search,
  Settings,
  Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalPayments: 0,
    totalRevenue: 0,
    upcomingEvents: 0,
  });
  const [recentEvents, setRecentEvents] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch user events
      const eventsRes = await fetch(
        `https://event-managements-server-chi.vercel.app/api/events/user/${user.uid}`,
      );
      const eventsData = await eventsRes.json();
      const userEvents = eventsData.data || [];

      // Fetch payments
      const paymentsRes = await fetch(
        `https://event-managements-server-chi.vercel.app/api/payments`,
      );
      const paymentsData = await paymentsRes.json();
      const userPayments = paymentsData.data || [];

      setStats({
        totalEvents: userEvents.length,
        totalPayments: userPayments.length,
        totalRevenue: userPayments.reduce((sum, p) => sum + (p.amount || 0), 0),
        upcomingEvents: userEvents.filter(e => new Date(e.date) > new Date())
          .length,
      });

      setRecentEvents(userEvents.slice(0, 3));
      setRecentPayments(userPayments.slice(0, 3));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-purple-200 rounded-full"></div>
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const statsCards = [
    {
      title: 'Total Events',
      value: stats.totalEvents,
      icon: Calendar,
      bg: 'bg-blue-50',
      textColor: 'text-blue-600',
      iconBg: 'bg-blue-100',
      trend: '+12%',
    },
    {
      title: 'Total Payments',
      value: stats.totalPayments,
      icon: CreditCard,
      bg: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      iconBg: 'bg-emerald-100',
      trend: '+8%',
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: TrendingUp,
      bg: 'bg-purple-50',
      textColor: 'text-purple-600',
      iconBg: 'bg-purple-100',
      trend: '+23%',
    },
    {
      title: 'Upcoming Events',
      value: stats.upcomingEvents,
      icon: Ticket,
      bg: 'bg-orange-50',
      textColor: 'text-orange-600',
      iconBg: 'bg-orange-100',
      trend: stats.upcomingEvents > 0 ? '+5%' : '0%',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed top-20 left-4 z-40 p-2.5 bg-white rounded-xl shadow-lg md:hidden hover:shadow-xl transition-all"
      >
        <Menu className="w-5 h-5 text-gray-600" />
      </button>

      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 min-w-0">
          {/* Top Bar */}
          <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 sm:px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex-1 max-w-md hidden md:block">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search events, payments..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <Bell className="w-5 h-5 text-gray-500" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-pink-500 rounded-full"></span>
                </button>
                <div className="flex items-center gap-2">
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {user.displayName || user.email?.split('@')[0]}
                    </p>
                    <p className="text-xs text-purple-600">Pro Member</p>
                  </div>
                  <div className="w-9 h-9 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-md">
                    <span className="text-white font-bold text-sm">
                      {user.displayName?.[0] || user.email?.[0]?.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 md:p-8">
            {/* Welcome Section */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                <span className="text-sm font-medium text-purple-600">
                  Dashboard
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Welcome back, {user.displayName || user.email?.split('@')[0]}!
              </h1>
              <p className="text-gray-500 mt-1 text-sm">
                Here's what's happening with your events today.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {statsCards.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all p-5 border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`${stat.iconBg} p-2.5 rounded-xl`}>
                      <stat.icon className={`w-5 h-5 ${stat.textColor}`} />
                    </div>
                    <span className={`text-2xl font-bold ${stat.textColor}`}>
                      {stat.value}
                    </span>
                  </div>
                  <p className="text-gray-600 font-medium text-sm">
                    {stat.title}
                  </p>
                  <div className="mt-2 flex items-center gap-1">
                    <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                      {stat.trend}
                    </span>
                    <span className="text-xs text-gray-400">
                      from last month
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Events */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-5 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-purple-600" />
                        <h2 className="font-bold text-gray-900">
                          Recent Events
                        </h2>
                      </div>
                      <Link
                        href="/dashboard/events"
                        className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
                      >
                        View All <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                  <div className="p-5">
                    {recentEvents.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Calendar className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-gray-500 text-sm">
                          No events created yet
                        </p>
                        <Link
                          href="/add-event"
                          className="text-purple-600 text-sm mt-2 inline-block"
                        >
                          Create your first event →
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {recentEvents.map(event => (
                          <Link
                            key={event._id}
                            href={`/events/${event._id}`}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                          >
                            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                              <img
                                src={event.image}
                                alt={event.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-gray-900 truncate">
                                {event.title}
                              </h3>
                              <p className="text-xs text-gray-500">
                                {new Date(event.date).toLocaleDateString()}
                              </p>
                            </div>
                            <span className="font-semibold text-purple-600">
                              ${event.price}
                            </span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Recent Payments */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-emerald-600" />
                      <h2 className="font-bold text-gray-900">
                        Recent Payments
                      </h2>
                    </div>
                    <Link
                      href="/dashboard/payments"
                      className="text-sm text-purple-600 hover:text-purple-700"
                    >
                      View All
                    </Link>
                  </div>
                </div>
                <div className="p-5">
                  {recentPayments.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <CreditCard className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-gray-500 text-sm">No payments yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentPayments.map(payment => (
                        <div
                          key={payment._id}
                          className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                          <div>
                            <h3 className="font-medium text-gray-900 text-sm">
                              {payment.eventTitle}
                            </h3>
                            <p className="text-xs text-gray-500">
                              {new Date(payment.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-emerald-600">
                              ${payment.amount}
                            </p>
                            <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                              {payment.status === 'succeeded'
                                ? 'Success'
                                : payment.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-500 mb-3">
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Link
                  href="/add-event"
                  className="flex items-center gap-2 p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all"
                >
                  <PlusCircle className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium">Add Event</span>
                </Link>
                <Link
                  href="/dashboard/events"
                  className="flex items-center gap-2 p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all"
                >
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">My Events</span>
                </Link>
                <Link
                  href="/dashboard/payments"
                  className="flex items-center gap-2 p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all"
                >
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-medium">Payments</span>
                </Link>
                <Link
                  href="/dashboard/settings"
                  className="flex items-center gap-2 p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all"
                >
                  <Settings className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium">Settings</span>
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
