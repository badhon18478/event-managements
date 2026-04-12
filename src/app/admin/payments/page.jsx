'use client';

import { useEffect, useState } from 'react';
import {
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  DollarSign,
  User,
  Loader2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    fetchPayments();
  }, [currentPage, searchTerm, statusFilter]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      console.log('Fetching payments from API...');

      // সঠিক API endpoint
      const res = await fetch(
        `https://event-managements-server-chi.vercel.app/api/admin/payments`,
      );
      const data = await res.json();

      console.log('API Response:', data);

      // ব্যাকএন্ডের response format অনুযায়ী ডাটা সেট করুন
      // ব্যাকএন্ড থেকে আসছে: { success: true, data: [...] }
      if (data.success && data.data) {
        setPayments(data.data);
        // Calculate total amount
        const total = data.data.reduce((sum, p) => sum + (p.amount || 0), 0);
        setTotalAmount(total);
        setTotalPages(Math.ceil(data.data.length / 15) || 1);
      }
      // অথবা যদি payments array আসে
      else if (data.payments) {
        setPayments(data.payments);
        setTotalAmount(data.totalAmount || 0);
        setTotalPages(data.totalPages || 1);
      } else {
        setPayments([]);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = status => {
    if (status === 'succeeded') {
      return (
        <span className="px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full">
          Success
        </span>
      );
    } else if (status === 'pending') {
      return (
        <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">
          Pending
        </span>
      );
    } else {
      return (
        <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">
          Failed
        </span>
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Payment Management
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          View and manage all transactions
        </p>
      </div>

      {/* Stats */}
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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by event or user..."
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:text-white"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:text-white"
        >
          <option value="all">All Status</option>
          <option value="succeeded">Success</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Payments Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Event
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {payments.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-5 py-12 text-center text-gray-500"
                  >
                    No payments found
                  </td>
                </tr>
              ) : (
                payments.map((payment, index) => (
                  <motion.tr
                    key={payment._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-5 py-3 text-sm text-gray-900 dark:text-white">
                      {payment.eventTitle || 'N/A'}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-500">
                      {payment.userEmail || 'N/A'}
                    </td>
                    <td className="px-5 py-3 text-sm font-semibold text-emerald-600">
                      ${payment.amount || 0}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-500">
                      {payment.createdAt
                        ? new Date(payment.createdAt).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    <td className="px-5 py-3">
                      {getStatusBadge(payment.status || 'pending')}
                    </td>
                    <td className="px-5 py-3">
                      <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                        <Download className="w-4 h-4 text-gray-500" />
                      </button>
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
