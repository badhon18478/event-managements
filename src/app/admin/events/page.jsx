'use client';

import { useEffect, useState } from 'react';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function AdminEventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [error, setError] = useState(null);

  const categories = [
    'all',
    'Technology',
    'Music',
    'Business',
    'Food',
    'Art',
    'Sports',
  ];

  useEffect(() => {
    fetchEvents();
  }, [currentPage, searchTerm, categoryFilter]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const API_URL =
        process.env.NEXT_PUBLIC_API_URL ||
        'https://event-managements-server-chi.vercel.app/api';
      const url = `${API_URL}/api/admin/events`;

      console.log('📡 Fetching events from:', url);

      const res = await fetch(url);
      const data = await res.json();
      console.log('📦 Full Response:', data);

      // 🔥 ব্যাকএন্ডের response format: { success: true, events: [...] }
      let eventsData = [];
      if (data.events && Array.isArray(data.events)) {
        eventsData = data.events;
        console.log('✅ Found events in data.events:', eventsData.length);
      } else if (data.data && Array.isArray(data.data)) {
        eventsData = data.data;
        console.log('✅ Found events in data.data:', eventsData.length);
      } else if (Array.isArray(data)) {
        eventsData = data;
        console.log('✅ Found events in array:', eventsData.length);
      } else {
        console.log('⚠️ No events found in response');
      }

      setEvents(eventsData);
      setTotalPages(Math.ceil(eventsData.length / 12) || 1);
    } catch (error) {
      console.error('Error fetching events:', error);
      setError(error.message);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async eventId => {
    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL ||
        'https://event-managements-server-chi.vercel.app/api';
      const res = await fetch(`${API_URL}/api/admin/events/${eventId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Event deleted successfully');
        fetchEvents();
      } else {
        toast.error('Failed to delete event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Error deleting event');
    }
    setShowDeleteModal(false);
    setSelectedEvent(null);
  };

  const getStatusBadge = date => {
    const eventDate = new Date(date);
    const now = new Date();
    if (eventDate > now) {
      return (
        <span className="px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full">
          Upcoming
        </span>
      );
    } else if (eventDate.toDateString() === now.toDateString()) {
      return (
        <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">
          Today
        </span>
      );
    } else {
      return (
        <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
          Past
        </span>
      );
    }
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
          onClick={fetchEvents}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Event Management
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage all events on the platform
        </p>
      </div>

      {/* Debug Info - Shows how many events found */}
      <div
        className={`rounded-lg p-3 text-sm ${events.length > 0 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
      >
        <p>
          📊 Total Events Found: <strong>{events.length}</strong>
        </p>
        {events.length === 0 && (
          <p className="text-xs mt-1">
            No events in database. Create some events first.
          </p>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search events by title..."
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={e => {
            setCategoryFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-purple-500"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat === 'all' ? 'All Categories' : cat}
            </option>
          ))}
        </select>
      </div>

      {/* Events Grid */}
      {events.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No events found</p>
          <p className="text-gray-400 text-sm mt-1">
            Create events from the user dashboard to see them here
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {events.map((event, index) => (
            <motion.div
              key={event._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="relative h-40">
                <img
                  src={
                    event.image ||
                    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400'
                  }
                  alt={event.title}
                  className="w-full h-full object-cover"
                  onError={e => {
                    e.target.src =
                      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400';
                  }}
                />
                <div className="absolute top-2 right-2">
                  {getStatusBadge(event.date)}
                </div>
                <div className="absolute bottom-2 left-2">
                  <span className="px-2 py-0.5 text-xs font-medium bg-black/50 text-white rounded-full">
                    {event.category}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                  {event.title}
                </h3>
                <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                  {event.shortDescription}
                </p>
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(event.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />${event.price}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Users className="w-3 h-3" />
                    {event.bookings || 0} booked
                  </div>
                  <div className="flex-1"></div>
                  <button
                    onClick={() => setSelectedEvent(event)}
                    className="p-1.5 hover:bg-gray-100 rounded-lg"
                  >
                    <Eye className="w-4 h-4 text-gray-500" />
                  </button>
                  <Link
                    href={`/admin/events/${event._id}/edit`}
                    className="p-1.5 hover:bg-gray-100 rounded-lg"
                  >
                    <Edit className="w-4 h-4 text-gray-500" />
                  </Link>
                  <button
                    onClick={() => {
                      setSelectedEvent(event);
                      setShowDeleteModal(true);
                    }}
                    className="p-1.5 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 hover:bg-gray-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 hover:bg-gray-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Event
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              Are you sure you want to delete{' '}
              <span className="font-medium text-gray-900">
                {selectedEvent.title}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteEvent(selectedEvent._id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
              >
                Delete Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
