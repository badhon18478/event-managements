'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
// import { useAuth } from '@/AuthContext/AuthProvider';
// import Sidebar from '@/components/layout/Sidebar';
import { useAuth } from '../../../AuthContext/AuthProvider';
import Sidebar from '../../../components/layout/Sidebar';
import { User, Mail, Bell, Shield, Save, Loader2, Menu } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    notifications: true,
    emailUpdates: true,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
    if (user) {
      setFormData({
        displayName: user.displayName || '',
        email: user.email || '',
        notifications: true,
        emailUpdates: true,
      });
    }
  }, [user, authLoading, router]);

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      // Update profile logic here
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Settings updated successfully!');
    } catch (error) {
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
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
        <Menu className="w-5 h-5 text-gray-600" />
      </button>

      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-6 md:p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-500 text-sm mb-6">
            Manage your account preferences
          </p>

          <div className="max-w-2xl">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Profile Section */}
              <div className="bg-white rounded-xl shadow-sm p-5">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-4 h-4 text-purple-600" /> Profile
                  Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={formData.displayName}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          displayName: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Email cannot be changed
                    </p>
                  </div>
                </div>
              </div>

              {/* Notifications */}
              <div className="bg-white rounded-xl shadow-sm p-5">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-purple-600" /> Notifications
                </h2>
                <div className="space-y-3">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm text-gray-700">
                      Push Notifications
                    </span>
                    <input
                      type="checkbox"
                      checked={formData.notifications}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          notifications: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm text-gray-700">Email Updates</span>
                    <input
                      type="checkbox"
                      checked={formData.emailUpdates}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          emailUpdates: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                  </label>
                </div>
              </div>

              {/* Security */}
              <div className="bg-white rounded-xl shadow-sm p-5">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-purple-600" /> Security
                </h2>
                <Link
                  href="/change-password"
                  className="text-sm text-purple-600 hover:text-purple-700"
                >
                  Change Password →
                </Link>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
