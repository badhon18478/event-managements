'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/AuthContext/AuthProvider';
import { Users, Calendar, CreditCard, TrendingUp, Shield } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const { user, userRole, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    totalPayments: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (userRole !== 'admin') {
        router.push('/dashboard');
      } else {
        fetchAdminStats();
      }
    }
  }, [user, userRole, loading, router]);

  const fetchAdminStats = async () => {
    try {
      const token = await user.getIdToken();
      const response = await fetch('/admin/api/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || userRole !== 'admin') {
    return null;
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: 'Total Events',
      value: stats.totalEvents,
      icon: Calendar,
      color: 'from-green-500 to-green-600',
      bg: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      title: 'Total Payments',
      value: stats.totalPayments,
      icon: CreditCard,
      color: 'from-purple-500 to-purple-600',
      bg: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: TrendingUp,
      color: 'from-orange-500 to-orange-600',
      bg: 'bg-orange-50',
      textColor: 'text-orange-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-6 h-6 text-purple-600" />
            <span className="text-sm font-medium text-purple-600">
              Admin Panel
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user.email}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.bg} p-3 rounded-xl`}>
                  <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
                <span className={`text-2xl font-bold ${stat.textColor}`}>
                  {stat.value}
                </span>
              </div>
              <p className="text-gray-600 font-medium">{stat.title}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/admin/users"
            className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-all hover:scale-[1.02]"
          >
            <Users className="w-10 h-10 text-purple-600 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900">
              User Management
            </h3>
            <p className="text-gray-500 text-sm mt-1">
              View and manage all users
            </p>
          </Link>

          <Link
            href="/admin/events"
            className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-all hover:scale-[1.02]"
          >
            <Calendar className="w-10 h-10 text-purple-600 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900">
              Event Management
            </h3>
            <p className="text-gray-500 text-sm mt-1">
              View and manage all events
            </p>
          </Link>

          <Link
            href="/admin/payments"
            className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-all hover:scale-[1.02]"
          >
            <CreditCard className="w-10 h-10 text-purple-600 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900">
              Payment Management
            </h3>
            <p className="text-gray-500 text-sm mt-1">View all transactions</p>
          </Link>

          <Link
            href="/admin/analytics"
            className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-all hover:scale-[1.02]"
          >
            <TrendingUp className="w-10 h-10 text-purple-600 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900">Analytics</h3>
            <p className="text-gray-500 text-sm mt-1">
              View platform analytics
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
