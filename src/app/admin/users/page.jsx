'use client';

import { useEffect, useState } from 'react';
import {
  Search,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  Shield,
  UserX,
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const API_URL =
        process.env.NEXT_PUBLIC_API_URL ||
        'https://event-managements-server-chi.vercel.app/api';
      const url = `${API_URL}/api/admin/users`;

      console.log('📡 Fetching users from:', url);

      const res = await fetch(url);
      const data = await res.json();
      console.log('📦 Response:', data);

      if (data.success && data.users) {
        setUsers(data.users);
        setTotalPages(data.totalPages || 1);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error.message);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async userId => {
    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL ||
        'https://event-managements-server-chi.vercel.app/api';
      const res = await fetch(`${API_URL}/api/admin/users/${userId}/block`, {
        method: 'POST',
      });

      if (res.ok) {
        toast.success('User blocked successfully');
        fetchUsers();
      } else {
        toast.error('Failed to block user');
      }
    } catch (error) {
      toast.error('Error blocking user');
    }
  };

  const handleMakeAdmin = async userId => {
    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL ||
        'https://event-managements-server-chi.vercel.app/api';
      const res = await fetch(
        `${API_URL}/api/admin/users/${userId}/make-admin`,
        {
          method: 'POST',
        },
      );

      if (res.ok) {
        toast.success('User promoted to admin');
        fetchUsers();
      } else {
        toast.error('Failed to make admin');
      }
    } catch (error) {
      toast.error('Error making admin');
    }
  };

  const getRoleBadge = (role, email) => {
    if (role === 'admin' || email === 'admin@eventhub.com') {
      return (
        <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
          Super Admin
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
        User
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-purple-200 rounded-full"></div>
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-600">Error: {error}</p>
        <button
          onClick={fetchUsers}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            User Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage all registered users ({users.length} total)
          </p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Add User
          </button>
        </div>
      </div>

      {/* Debug Info */}
      <div
        className={`rounded-lg p-3 text-sm ${users.length > 0 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
      >
        <p>
          📊 Total Users Found: <strong>{users.length}</strong>
        </p>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Events
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Spent
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-5 py-12 text-center text-gray-500"
                  >
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user, index) => (
                  <motion.tr
                    key={user._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {user.displayName?.[0] ||
                              user.email?.[0]?.toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {user.displayName || 'User'}
                          </p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      {getRoleBadge(user.role, user.email)}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-500">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-900">
                      {user.eventCount || 0}
                    </td>
                    <td className="px-5 py-3 text-sm font-semibold text-emerald-600">
                      ${(user.totalSpent || 0).toFixed(2)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 text-gray-500" />
                        </button>
                        {user.role !== 'admin' && (
                          <>
                            <button
                              onClick={() => handleMakeAdmin(user._id)}
                              className="p-1.5 hover:bg-purple-50 rounded-lg"
                              title="Make Admin"
                            >
                              <Shield className="w-4 h-4 text-purple-500" />
                            </button>
                            <button
                              onClick={() => handleBlockUser(user._id)}
                              className="p-1.5 hover:bg-red-50 rounded-lg"
                              title="Block User"
                            >
                              <UserX className="w-4 h-4 text-red-500" />
                            </button>
                          </>
                        )}
                      </div>
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
