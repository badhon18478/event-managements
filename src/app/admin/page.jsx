'use client';

import { useEffect, useState } from 'react';
import {
  Users,
  Calendar,
  CreditCard,
  DollarSign,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
// import { useAuth } from '@/AuthContext/AuthProvider';
import { useAuth } from '../../AuthContext/AuthProvider';
export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    totalPayments: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchStats();
    } else {
      console.log('No user found, waiting for auth...');
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const API_URL =
        process.env.NEXT_PUBLIC_API_URL ||
        'https://event-managements-server-chi.vercel.app/api';
      const token = await user?.getIdToken();

      console.log('📡 Fetching stats from:', `${API_URL}/api/admin/stats`);
      console.log('🔑 Token exists:', !!token);
      console.log('👤 User email:', user?.email);

      if (!token) {
        throw new Error('No authentication token available');
      }

      const res = await fetch(`${API_URL}/api/admin/stats`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📦 Response status:', res.status);

      const data = await res.json();
      console.log('📦 Response data:', data);

      if (res.ok && data.success) {
        setStats(data.stats);
      } else {
        throw new Error(data.message || 'Failed to fetch stats');
      }
    } catch (error) {
      console.error('❌ Error fetching stats:', error);
      setError(error.message);
      toast.error(error.message || 'Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        <p className="text-gray-500 mt-3">Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <p className="text-red-600 font-medium mb-2">
          Failed to load dashboard
        </p>
        <p className="text-gray-500 text-sm mb-4">{error}</p>
        <button
          onClick={fetchStats}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          <RefreshCw className="w-4 h-4" /> Try Again
        </button>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      bg: 'bg-blue-50',
      textColor: 'text-blue-600',
      iconBg: 'bg-blue-100',
    },
    {
      title: 'Total Events',
      value: stats.totalEvents,
      icon: Calendar,
      bg: 'bg-purple-50',
      textColor: 'text-purple-600',
      iconBg: 'bg-purple-100',
    },
    {
      title: 'Total Payments',
      value: stats.totalPayments,
      icon: CreditCard,
      bg: 'bg-green-50',
      textColor: 'text-green-600',
      iconBg: 'bg-green-100',
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      bg: 'bg-orange-50',
      textColor: 'text-orange-600',
      iconBg: 'bg-orange-100',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Welcome back, {user?.displayName || user?.email?.split('@')[0]}!
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`${stat.iconBg} p-2.5 rounded-xl`}>
                <stat.icon className={`w-5 h-5 ${stat.textColor}`} />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {stat.value}
              </span>
            </div>
            <p className="text-gray-600 font-medium text-sm">{stat.title}</p>
          </motion.div>
        ))}
      </div>

      {/* Debug info - remove in production */}
      <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500">
        <p>🔧 Debug: API URL: {process.env.NEXT_PUBLIC_API_URL}</p>
        <p>🔧 Debug: User logged in: {user?.email}</p>
      </div>
    </div>
  );
}
