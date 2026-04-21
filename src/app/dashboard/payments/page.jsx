'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
// import { useAuth } from '@/AuthContext/AuthProvider';
// import Sidebar from '@/components/layout/Sidebar';
import { useAuth } from '../../../AuthContext/AuthProvider';
import Sidebar from '../../../components/layout/Sidebar';
import { getUserPayments } from '../../../lib/api';
import { CreditCard, Download, Calendar, Search, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PaymentsHistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchPayments();
    }
  }, [user]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      console.log('Fetching payments for user:', user?.uid);

      const response = await getUserPayments();
      console.log('Payments API Response:', response);

      // Handle different response formats
      let paymentsData = [];
      if (response?.data && Array.isArray(response.data)) {
        paymentsData = response.data;
      } else if (Array.isArray(response)) {
        paymentsData = response;
      }

      console.log('Payments data:', paymentsData);
      setPayments(paymentsData);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.eventTitle
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || payment.status === filter;
    return matchesSearch && matchesFilter;
  });

  const totalAmount = filteredPayments.reduce(
    (sum, p) => sum + (p.amount || 0),
    0,
  );
  const currentMonthPayments = payments.filter(p => {
    const paymentDate = new Date(p.createdAt);
    const now = new Date();
    return (
      paymentDate.getMonth() === now.getMonth() &&
      paymentDate.getFullYear() === now.getFullYear()
    );
  });

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed top-20 left-4 z-30 p-2 bg-white rounded-lg shadow-md md:hidden"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-6 md:p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Payment History
          </h1>
          <p className="text-gray-600 mb-8">View all your past transactions</p>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <CreditCard className="w-8 h-8 opacity-80" />
                <span className="text-3xl font-bold">{payments.length}</span>
              </div>
              <p className="opacity-90">Total Transactions</p>
            </div>

            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold">$</span>
                <span className="text-3xl font-bold">
                  {totalAmount.toFixed(2)}
                </span>
              </div>
              <p className="opacity-90">Total Spent</p>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <Calendar className="w-8 h-8 opacity-80" />
                <span className="text-3xl font-bold">
                  {currentMonthPayments.length}
                </span>
              </div>
              <p className="opacity-90">This Month</p>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by event name..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <select
                value={filter}
                onChange={e => setFilter(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Status</option>
                <option value="succeeded">Success</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>

          {/* Payments Table */}
          {filteredPayments.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
              <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Payments Found
              </h3>
              <p className="text-gray-500 mb-6">
                You haven't made any payments yet.
              </p>
              <Link
                href="/events"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all"
              >
                Browse Events
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Event
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Amount
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Receipt
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredPayments.map(payment => (
                      <tr
                        key={payment._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                              <span className="text-purple-600 font-bold">
                                {payment.eventTitle?.charAt(0) || 'E'}
                              </span>
                            </div>
                            <span className="font-medium text-gray-900">
                              {payment.eventTitle}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {new Date(payment.createdAt).toLocaleDateString(
                            'en-US',
                            {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            },
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-green-600">
                            ${payment.amount}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              payment.status === 'succeeded'
                                ? 'bg-green-100 text-green-800'
                                : payment.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {payment.status === 'succeeded'
                              ? 'Success'
                              : payment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => {
                              // Create receipt link
                              const receiptUrl = `/api/payments/${payment._id}/receipt`;
                              window.open(receiptUrl, '_blank');
                            }}
                            className="text-purple-600 hover:text-purple-700"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
