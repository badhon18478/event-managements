'use client';

import { useEffect, useState } from 'react';
import {
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  ArrowUp,
  ArrowDown,
  Download,
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState({
    userGrowth: [],
    revenueGrowth: [],
    eventGrowth: [],
    topEvents: [],
    recentActivity: [],
    summary: {
      totalUsers: 0,
      totalEvents: 0,
      totalRevenue: 0,
      growthRate: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('monthly');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/analytics?period=${period}`);
      const data = await res.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Analytics & Reports
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Track platform performance and growth
          </p>
        </div>
        <div className="flex gap-3">
          <select
            value={period}
            onChange={e => setPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
          >
            <option value="weekly">Last 7 Days</option>
            <option value="monthly">Last 30 Days</option>
            <option value="yearly">Last 12 Months</option>
          </select>
          <button className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-xl">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-xs text-emerald-600 flex items-center">
              <ArrowUp className="w-3 h-3" /> +12%
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-3">
            {analytics.summary.totalUsers}
          </p>
          <p className="text-sm text-gray-500">Total Users</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div className="bg-emerald-100 dark:bg-emerald-900/50 p-3 rounded-xl">
              <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-xs text-emerald-600 flex items-center">
              <ArrowUp className="w-3 h-3" /> +8%
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-3">
            {analytics.summary.totalEvents}
          </p>
          <p className="text-sm text-gray-500">Total Events</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div className="bg-purple-100 dark:bg-purple-900/50 p-3 rounded-xl">
              <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-xs text-emerald-600 flex items-center">
              <ArrowUp className="w-3 h-3" /> +23%
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-3">
            ${analytics.summary.totalRevenue.toFixed(2)}
          </p>
          <p className="text-sm text-gray-500">Total Revenue</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div className="bg-orange-100 dark:bg-orange-900/50 p-3 rounded-xl">
              <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <span className="text-xs text-emerald-600 flex items-center">
              <ArrowUp className="w-3 h-3" /> +{analytics.summary.growthRate}%
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-3">
            {analytics.summary.growthRate}%
          </p>
          <p className="text-sm text-gray-500">Growth Rate</p>
        </motion.div>
      </div>

      {/* Charts - Simplified for now */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            User Growth
          </h3>
          <div className="space-y-3">
            {analytics.userGrowth.map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <span>{item.period}</span>
                  <span>{item.count} users</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{
                      width: `${(item.count / Math.max(...analytics.userGrowth.map(d => d.count))) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            Revenue Growth
          </h3>
          <div className="space-y-3">
            {analytics.revenueGrowth.map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <span>{item.period}</span>
                  <span>${item.amount}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-emerald-600 h-2 rounded-full"
                    style={{
                      width: `${(item.amount / Math.max(...analytics.revenueGrowth.map(d => d.amount))) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Events */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
          Top Performing Events
        </h3>
        <div className="space-y-4">
          {analytics.topEvents.map((event, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-gray-400">
                  #{i + 1}
                </span>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {event.title}
                  </p>
                  <p className="text-xs text-gray-500">{event.category}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-purple-600">
                  ${event.revenue}
                </p>
                <p className="text-xs text-gray-500">
                  {event.bookings} bookings
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
