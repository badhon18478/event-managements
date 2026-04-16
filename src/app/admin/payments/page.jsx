'use client';

import { useEffect, useState } from 'react';
import { Search, CreditCard, DollarSign, User, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '@/AuthContext/AuthProvider';

export default function AdminPaymentsPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchPayments();
    }
  }, [user]);

  const getToken = async () => {
    if (!user) return null;
    return await user.getIdToken();
  };

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);

      const API_URL =
        process.env.NEXT_PUBLIC_API_URL ||
        'https://event-managements-server-chi.vercel.app/api';
      const token = await getToken();

      console.log(
        '📡 Fetching payments from:',
        `${API_URL}/api/admin/payments`,
      );

      const res = await fetch(`${API_URL}/api/admin/payments`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      console.log('📦 Payments response:', data);

      let paymentsData = [];
      let total = 0;

      if (data.success && data.data) {
        paymentsData = data.data;
        total = data.totalAmount || 0;
      } else if (data.payments) {
        paymentsData = data.payments;
        total = data.totalAmount || 0;
      } else if (Array.isArray(data)) {
        paymentsData = data;
        total = data.reduce((sum, p) => sum + (p.amount || 0), 0);
      }

      setPayments(paymentsData);
      setTotalAmount(total);
    } catch (error) {
      console.error('Error fetching payments:', error);
      setError(error.message);
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter(
    p =>
      p.eventTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

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
          onClick={fetchPayments}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Payment Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Track all transactions ({payments.length} total)
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by event or user..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <CreditCard className="w-6 h-6 opacity-80" />
            <span className="text-2xl font-bold">{payments.length}</span>
          </div>
          <p className="text-sm opacity-90 mt-1">Total Transactions</p>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <DollarSign className="w-6 h-6 opacity-80" />
            <span className="text-2xl font-bold">
              ${totalAmount.toFixed(2)}
            </span>
          </div>
          <p className="text-sm opacity-90 mt-1">Total Revenue</p>
        </div>
        <div className="bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <User className="w-6 h-6 opacity-80" />
            <span className="text-2xl font-bold">
              {new Set(payments.map(p => p.userId)).size}
            </span>
          </div>
          <p className="text-sm opacity-90 mt-1">Unique Customers</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">
                  Event
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">
                  User
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">
                  Amount
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-5 py-12 text-center text-gray-500"
                  >
                    No payments found
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment, index) => (
                  <motion.tr
                    key={payment._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-5 py-3 text-sm text-gray-900">
                      {payment.eventTitle}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-500">
                      {payment.userEmail}
                    </td>
                    <td className="px-5 py-3 text-sm font-semibold text-emerald-600">
                      ${payment.amount}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-500">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
