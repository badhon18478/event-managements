'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/AuthContext/AuthProvider';
import Sidebar from '@/components/layout/Sidebar';
import { getEventsByUser, deleteEvent } from '@/lib/api';
import {
  Calendar,
  DollarSign,
  Trash2,
  Edit,
  Eye,
  PlusCircle,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function MyEventsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.uid) {
      fetchEvents();
    }
  }, [user]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      console.log('Fetching events for user:', user?.uid);

      const response = await getEventsByUser(user?.uid);
      console.log('API Response:', response);

      // Handle different response formats
      const eventsData = response?.data || response || [];
      setEvents(Array.isArray(eventsData) ? eventsData : []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async eventId => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    setDeletingId(eventId);
    try {
      await deleteEvent(eventId);
      setEvents(events.filter(e => e._id !== eventId));
      toast.success('Event deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete event');
    } finally {
      setDeletingId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!user) return null;

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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Events</h1>
              <p className="text-gray-600 mt-1">
                Manage all your created events
              </p>
            </div>
            <Link
              href="/add-event"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all"
            >
              <PlusCircle className="w-5 h-5" />
              Create Event
            </Link>
          </div>

          {events.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Events Yet
              </h3>
              <p className="text-gray-500 mb-6">
                Create your first event to get started!
              </p>
              <Link
                href="/add-event"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all"
              >
                <PlusCircle className="w-5 h-5" />
                Create Event
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map(event => (
                <div
                  key={event._id}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="relative h-48">
                    <img
                      src={
                        event.image ||
                        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'
                      }
                      alt={event.title}
                      className="w-full h-full object-cover"
                      onError={e => {
                        e.target.src =
                          'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800';
                      }}
                    />
                    <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded-lg text-sm font-bold text-purple-600 shadow">
                      ${event.price}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-1">
                      {event.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                      {event.shortDescription}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                      <Calendar className="w-4 h-4" />
                      {new Date(event.date).toLocaleDateString()}
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/events/${event._id}`}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Eye className="w-4 h-4" /> View
                      </Link>
                      <Link
                        href={`/edit-event/${event._id}`}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <Edit className="w-4 h-4" /> Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(event._id)}
                        disabled={deletingId === event._id}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                      >
                        {deletingId === event._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
