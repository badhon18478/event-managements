'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Calendar,
  CreditCard,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Eye,
  DollarSign,
  UserPlus,
  CalendarCheck,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    totalPayments: 0,
    totalRevenue: 0,
    activeUsers: 0,
    newUsersThisMonth: 0,
    eventsThisMonth: 0,
    revenueThisMonth: 0,
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch stats from API
      const statsRes = await fetch('/api/admin/stats');
      const statsData = await statsRes.json();
      setStats(statsData);

      // Fetch recent users
      const usersRes = await fetch('/api/admin/users?limit=5');
      const usersData = await usersRes.json();
      setRecentUsers(usersData.users || []);

      // Fetch recent events
      const eventsRes = await fetch('/api/admin/events?limit=5');
      const eventsData = await eventsRes.json();
      setRecentEvents(eventsData.events || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400',
      trend: '+12%',
      trendUp: true,
    },
    {
      title: 'Total Events',
      value: stats.totalEvents,
      icon: Calendar,
      color: 'from-emerald-500 to-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      trend: '+8%',
      trendUp: true,
    },
    {
      title: 'Total Payments',
      value: stats.totalPayments,
      icon: CreditCard,
      color: 'from-purple-500 to-purple-600',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      textColor: 'text-purple-600 dark:text-purple-400',
      trend: '+23%',
      trendUp: true,
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'from-orange-500 to-orange-600',
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      textColor: 'text-orange-600 dark:text-orange-400',
      trend: '+15%',
      trendUp: true,
    },
  ];

  const secondaryStats = [
    {
      title: 'Active Users',
      value: stats.activeUsers,
      icon: UserPlus,
      change: '+5',
    },
    {
      title: 'New Users (This Month)',
      value: stats.newUsersThisMonth,
      icon: UserPlus,
      change: '+12',
    },
    {
      title: 'Events This Month',
      value: stats.eventsThisMonth,
      icon: CalendarCheck,
      change: '+3',
    },
    {
      title: 'Revenue This Month',
      value: `$${stats.revenueThisMonth.toFixed(2)}`,
      icon: TrendingUp,
      change: '+$2,500',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-purple-200 rounded-full"></div>
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Welcome back, Admin! Here's what's happening with your platform.
        </p>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className={`${stat.bg} p-3 rounded-xl`}>
                <stat.icon className={`w-5 h-5 ${stat.textColor}`} />
              </div>
              <div
                className={`flex items-center gap-1 text-xs ${stat.trendUp ? 'text-emerald-600' : 'text-red-600'}`}
              >
                {stat.trendUp ? (
                  <ArrowUp className="w-3 h-3" />
                ) : (
                  <ArrowDown className="w-3 h-3" />
                )}
                <span>{stat.trend}</span>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {stat.title}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {secondaryStats.map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3"
          >
            <div className="flex items-center justify-between">
              <stat.icon className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-emerald-600">+{stat.change}</span>
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-white mt-2">
              {stat.value}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {stat.title}
            </p>
          </div>
        ))}
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-5 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                <h2 className="font-semibold text-gray-900 dark:text-white">
                  Recent Users
                </h2>
              </div>
              <Link
                href="/admin/users"
                className="text-sm text-purple-600 hover:text-purple-700"
              >
                View All →
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {recentUsers.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500">No users found</p>
              </div>
            ) : (
              recentUsers.map(user => (
                <div
                  key={user._id}
                  className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 dark:text-purple-400 font-medium">
                        {user.displayName?.[0] ||
                          user.email?.[0]?.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {user.displayName || user.email?.split('@')[0]}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Events */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-5 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                <h2 className="font-semibold text-gray-900 dark:text-white">
                  Recent Events
                </h2>
              </div>
              <Link
                href="/admin/events"
                className="text-sm text-purple-600 hover:text-purple-700"
              >
                View All →
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {recentEvents.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500">No events found</p>
              </div>
            ) : (
              recentEvents.map(event => (
                <div
                  key={event._id}
                  className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {event.title}
                      </p>
                      <p className="text-xs text-gray-500">{event.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-purple-600">
                      ${event.price}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(event.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-4 text-white">
          <Eye className="w-5 h-5 opacity-80 mb-2" />
          <p className="text-2xl font-bold">12.5k</p>
          <p className="text-sm opacity-80">Total Views</p>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl p-4 text-white">
          <TrendingUp className="w-5 h-5 opacity-80 mb-2" />
          <p className="text-2xl font-bold">+32%</p>
          <p className="text-sm opacity-80">Growth Rate</p>
        </div>
        <div className="bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl p-4 text-white">
          <CreditCard className="w-5 h-5 opacity-80 mb-2" />
          <p className="text-2xl font-bold">342</p>
          <p className="text-sm opacity-80">Active Bookings</p>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-4 text-white">
          <Calendar className="w-5 h-5 opacity-80 mb-2" />
          <p className="text-2xl font-bold">18</p>
          <p className="text-sm opacity-80">Upcoming Events</p>
        </div>
      </div>
    </div>
  );
}
