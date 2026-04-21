'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
// import { useAuth } from '@/AuthContext/AuthProvider';
import { Shield, Bell, Mail, Globe, Save, Loader2, Menu } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../../AuthContext/AuthProvider';
export default function AdminSettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    siteName: 'EventHub',
    siteEmail: 'admin@eventhub.com',
    maintenanceMode: false,
    emailNotifications: true,
    newUserAlert: true,
    paymentAlert: true,
    currency: 'USD',
    timezone: 'Asia/Dhaka',
  });

  useEffect(() => {
    if (!authLoading && (!user || user.email !== 'admin@eventhub.com')) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Admin Settings
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Configure platform settings and preferences
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
        {/* General Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Globe className="w-4 h-4 text-purple-600" /> General Settings
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Site Name
              </label>
              <input
                type="text"
                value={settings.siteName}
                onChange={e =>
                  setSettings({ ...settings, siteName: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Admin Email
              </label>
              <input
                type="email"
                value={settings.siteEmail}
                onChange={e =>
                  setSettings({ ...settings, siteEmail: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Currency
                </label>
                <select
                  value={settings.currency}
                  onChange={e =>
                    setSettings({ ...settings, currency: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
                >
                  <option>USD</option>
                  <option>EUR</option>
                  <option>GBP</option>
                  <option>BDT</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Timezone
                </label>
                <select
                  value={settings.timezone}
                  onChange={e =>
                    setSettings({ ...settings, timezone: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
                >
                  <option>Asia/Dhaka</option>
                  <option>Asia/Kolkata</option>
                  <option>America/New_York</option>
                  <option>Europe/London</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Bell className="w-4 h-4 text-purple-600" /> Notification Settings
          </h2>
          <div className="space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Email Notifications
              </span>
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={e =>
                  setSettings({
                    ...settings,
                    emailNotifications: e.target.checked,
                  })
                }
                className="w-4 h-4 text-purple-600 rounded"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                New User Alerts
              </span>
              <input
                type="checkbox"
                checked={settings.newUserAlert}
                onChange={e =>
                  setSettings({ ...settings, newUserAlert: e.target.checked })
                }
                className="w-4 h-4 text-purple-600 rounded"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Payment Alerts
              </span>
              <input
                type="checkbox"
                checked={settings.paymentAlert}
                onChange={e =>
                  setSettings({ ...settings, paymentAlert: e.target.checked })
                }
                className="w-4 h-4 text-purple-600 rounded"
              />
            </label>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-600" /> Security
          </h2>
          <div className="space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Maintenance Mode
              </span>
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={e =>
                  setSettings({
                    ...settings,
                    maintenanceMode: e.target.checked,
                  })
                }
                className="w-4 h-4 text-purple-600 rounded"
              />
            </label>
            <button
              type="button"
              className="text-sm text-purple-600 hover:text-purple-700"
            >
              Change Admin Password →
            </button>
          </div>
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
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}
