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
} from 'lucide-react';

export default function DashboardPage() {
  const { user, loading: authLoading, userRole } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalPayments: 0,
    totalRevenue: 0,
    upcomingEvents: 0,
  });
  const [recentEvents, setRecentEvents] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Admin redirect
  useEffect(() => {
    if (!authLoading && user && userRole === 'admin') {
      router.push('/admin');
    }
  }, [user, userRole, authLoading, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

      console.log(
        '📡 Fetching data from:',
        `${API_URL}/api/events/user/${user.uid}`,
      );

      // Fetch user events
      const eventsRes = await fetch(`${API_URL}/api/events/user/${user.uid}`);

      if (!eventsRes.ok) {
        throw new Error(`HTTP ${eventsRes.status}`);
      }

      const eventsData = await eventsRes.json();
      const userEvents = eventsData.data || eventsData || [];

      // Fetch user payments
      let userPayments = [];
      try {
        const token = await user.getIdToken();
        const paymentsRes = await fetch(`${API_URL}/api/payments`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (paymentsRes.ok) {
          const paymentsData = await paymentsRes.json();
          userPayments = paymentsData.data || paymentsData || [];
        }
      } catch (err) {
        console.log('No payments yet');
      }

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
      console.error('Error:', error);
      setError(
        'Failed to load dashboard data. Please make sure backend is running.',
      );
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) return null;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-10 h-10 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Connection Error
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
            <p className="text-sm font-mono">To fix:</p>
            <p className="text-xs text-gray-600 mt-1">1. Open terminal</p>
            <code className="text-xs block bg-gray-200 p-1 rounded mt-1">
              cd event-managements-server
            </code>
            <code className="text-xs block bg-gray-200 p-1 rounded mt-1">
              node index.js
            </code>
          </div>
          <button
            onClick={fetchDashboardData}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const statsCards = [
    {
      title: 'Total Events',
      value: stats.totalEvents,
      icon: Calendar,
      bg: 'bg-blue-50',
      textColor: 'text-blue-600',
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
      icon: TrendingUp,
      bg: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      title: 'Upcoming Events',
      value: stats.upcomingEvents,
      icon: Ticket,
      bg: 'bg-orange-50',
      textColor: 'text-orange-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed top-20 left-4 z-30 p-2 bg-white rounded-lg shadow-md md:hidden"
      >
        <Menu className="w-5 h-5 text-gray-600" />
      </button>

      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-6 md:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Welcome back, {user.displayName || user.email?.split('@')[0]}!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsCards.map((stat, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-sm p-6">
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Recent Events
                </h2>
                <Link
                  href="/dashboard/events"
                  className="text-purple-600 text-sm"
                >
                  View All →
                </Link>
              </div>

              {recentEvents.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No events yet</p>
                  <Link
                    href="/add-event"
                    className="text-purple-600 text-sm mt-2 inline-block"
                  >
                    Create Event →
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentEvents.map(event => (
                    <Link
                      key={event._id}
                      href={`/events/${event._id}`}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50"
                    >
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {event.title}
                        </p>
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

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Recent Payments
                </h2>
                <Link
                  href="/dashboard/payments"
                  className="text-purple-600 text-sm"
                >
                  View All →
                </Link>
              </div>

              {recentPayments.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No payments yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentPayments.map(payment => (
                    <div
                      key={payment._id}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {payment.eventTitle}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="font-semibold text-green-600">
                        ${payment.amount}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
