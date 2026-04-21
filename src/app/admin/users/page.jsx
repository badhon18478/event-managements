'use client';

import { useEffect, useState } from 'react';
import { Users, Calendar, CreditCard, DollarSign, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
// import { useAuth } from '@/AuthContext/AuthProvider';
import { useAuth } from '../../../AuthContext/AuthProvider';

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
    }
  }, [user]);

  const getToken = async () => {
    if (!user) return null;
    return await user.getIdToken();
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const API_URL =
        process.env.NEXT_PUBLIC_API_URL ||
        'https://event-managements-server-chi.vercel.app/api';
      const token = await getToken();

      console.log('📡 Fetching stats from:', `${API_URL}/api/admin/stats`);

      const res = await fetch(`${API_URL}/api/admin/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      console.log('📦 Stats response:', data);

      if (data.success && data.stats) {
        setStats(data.stats);
      } else {
        setStats({
          totalUsers: 0,
          totalEvents: 0,
          totalPayments: 0,
          totalRevenue: 0,
        });
        if (data.message) toast.error(data.message);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError(error.message);
      toast.error('Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-600">Error: {error}</p>
        <button
          onClick={fetchStats}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg"
        >
          Try Again
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
    },
    {
      title: 'Total Events',
      value: stats.totalEvents,
      icon: Calendar,
      bg: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      title: 'Total Payments',
      value: stats.totalPayments,
      icon: CreditCard,
      bg: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      bg: 'bg-orange-50',
      textColor: 'text-orange-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of your platform</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm p-5 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`${stat.bg} p-2.5 rounded-xl`}>
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
    </div>
  );
}
