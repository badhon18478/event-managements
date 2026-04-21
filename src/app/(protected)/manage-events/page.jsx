'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getAllEvents, deleteEvent } from '../../../lib/api'; // getAllEvents ইম্পোর্ট করুন
// import { useAuth } from '@/AuthContext/AuthProvider';
import { useAuth } from '../../../AuthContext/AuthProvider';

export default function ManageEventsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Fetch events when user is available
  useEffect(() => {
    if (user?.uid) {
      fetchEvents();
    }
  }, [user]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching all events and filtering for user:', user.uid);

      // getAllEvents ব্যবহার করুন
      const response = await getAllEvents();
      console.log('All events response:', response);

      // বিভিন্ন রেসপন্স ফরম্যাট হ্যান্ডেল করুন
      let allEvents = [];
      if (response?.data) {
        allEvents = response.data;
      } else if (Array.isArray(response)) {
        allEvents = response;
      } else if (response?.events) {
        allEvents = response.events;
      }

      // ইউজারের ইভেন্ট ফিল্টার করুন
      const userEvents = Array.isArray(allEvents)
        ? allEvents.filter(
            event =>
              event.userId === user.uid || event.userEmail === user.email,
          )
        : [];

      console.log(`Found ${userEvents.length} events for user ${user.uid}`);
      setEvents(userEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      setError(error.message || 'Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async id => {
    if (
      !confirm(
        'Are you sure you want to delete this event? This action cannot be undone.',
      )
    ) {
      return;
    }

    setDeleteId(id);
    setError(null);
    setSuccessMessage(null);

    try {
      await deleteEvent(id);

      // Remove deleted event from state
      setEvents(prevEvents => prevEvents.filter(event => event._id !== id));
      setSuccessMessage('Event deleted successfully!');

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error deleting event:', error);
      setError(error.message || 'Failed to delete event. Please try again.');
    } finally {
      setDeleteId(null);
    }
  };

  // Show loading state
  if (authLoading) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!user) {
    return null;
  }

  return (
    <div className="pt-24 pb-16 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Manage Events
            </h1>
            <p className="text-gray-600">
              View and manage all your created events
            </p>
          </div>
          <Link
            href="/add-event"
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
          >
            Create New Event
          </Link>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-600 flex items-center gap-2">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 flex items-center gap-2">
            <svg
              className="w-5 h-5"
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
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* No Events State */}
        {!loading && events.length === 0 && (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <svg
              className="w-24 h-24 text-gray-300 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No Events Yet
            </h2>
            <p className="text-gray-600 mb-6">
              You haven't created any events yet. Start by creating your first
              event!
            </p>
            <Link
              href="/add-event"
              className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
            >
              Create Your First Event
            </Link>
          </div>
        )}

        {/* Events List */}
        {!loading && events.length > 0 && (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-xl shadow-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Event
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Price
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {events.map(event => (
                    <tr
                      key={event._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <img
                            src={
                              event.image ||
                              'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'
                            }
                            alt={event.title}
                            className="w-16 h-16 rounded-lg object-cover mr-4"
                            onError={e => {
                              e.target.src =
                                'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800';
                            }}
                          />
                          <div>
                            <p className="font-semibold text-gray-900">
                              {event.title}
                            </p>
                            <p className="text-sm text-gray-500 line-clamp-1">
                              {event.shortDescription}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-purple-100 text-purple-600 text-sm font-semibold rounded-full">
                          {event.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {new Date(event.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-gray-700 font-semibold">
                        ${event.price}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/events/${event._id}`}
                            className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors font-medium"
                          >
                            View
                          </Link>
                          <button
                            onClick={() => handleDelete(event._id)}
                            disabled={deleteId === event._id}
                            className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {deleteId === event._id ? (
                              <span className="flex items-center gap-1">
                                <svg
                                  className="animate-spin h-4 w-4"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    fill="none"
                                  />
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  />
                                </svg>
                                Deleting...
                              </span>
                            ) : (
                              'Delete'
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {events.map(event => (
                <div
                  key={event._id}
                  className="bg-white rounded-xl shadow-md overflow-hidden"
                >
                  <div className="flex">
                    <img
                      src={
                        event.image ||
                        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'
                      }
                      alt={event.title}
                      className="w-24 h-24 object-cover"
                      onError={e => {
                        e.target.src =
                          'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800';
                      }}
                    />
                    <div className="flex-1 p-4">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {event.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {event.category} • ${event.price}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(event.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex border-t">
                    <Link
                      href={`/events/${event._id}`}
                      className="flex-1 px-4 py-3 text-center bg-blue-50 text-blue-600 font-medium hover:bg-blue-100 transition-colors"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => handleDelete(event._id)}
                      disabled={deleteId === event._id}
                      className="flex-1 px-4 py-3 text-center bg-red-50 text-red-600 font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      {deleteId === event._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl shadow-md p-6">
                <p className="text-sm text-gray-600 mb-1">Total Events</p>
                <p className="text-3xl font-bold text-gray-900">
                  {events.length}
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6">
                <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">
                  $
                  {events
                    .reduce((sum, e) => sum + (Number(e.price) || 0), 0)
                    .toFixed(2)}
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6">
                <p className="text-sm text-gray-600 mb-1">Upcoming Events</p>
                <p className="text-3xl font-bold text-gray-900">
                  {events.filter(e => new Date(e.date) > new Date()).length}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
