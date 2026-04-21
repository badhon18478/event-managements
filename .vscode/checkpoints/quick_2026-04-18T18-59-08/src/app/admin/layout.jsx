'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../AuthContext/AuthProvider';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Menu } from 'lucide-react';

export default function AdminLayout({ children }) {
  const { user, userRole, loading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  console.log('🔍 Admin Layout - loading:', loading);
  console.log('🔍 Admin Layout - user:', user?.email);
  console.log('🔍 Admin Layout - userRole:', userRole);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        console.log('➡️ No user, redirecting to login');
        router.push('/login');
      } else if (userRole !== 'admin') {
        console.log('➡️ Not admin, redirecting to home');
        router.push('/');
      } else {
        console.log('✅ Admin user confirmed');
      }
    }
  }, [user, userRole, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-purple-200 rounded-full"></div>
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
      </div>
    );
  }

  if (!user || userRole !== 'admin') {
    return null;
  }

  console.log('🎨 Rendering Admin Layout with Sidebar');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md md:hidden"
      >
        <Menu className="w-5 h-5 text-gray-600" />
      </button>

      <div className="flex">
        <AdminSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="flex-1 min-w-0">
          <div className="p-4 md:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
