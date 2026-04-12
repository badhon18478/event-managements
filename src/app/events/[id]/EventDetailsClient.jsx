'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import * as React from 'react';
import {
  Calendar,
  MapPin,
  Tag,
  Heart,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function EventDetailsClient({ params }) {
  const { id } = React.use(params);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [booking, setBooking] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError(null);

        const API_URLS = [
          process.env.NEXT_PUBLIC_API_URL,
          'https://event-managements-server-chi.vercel.app/api',
          'http://localhost:5000/api',
        ].filter(Boolean);

        let lastError = null;

        for (const API_URL of API_URLS) {
          try {
            const fullUrl = `${API_URL}/events/${id}`;
            const response = await axios.get(fullUrl, {
              timeout: 10000,
              headers: { 'Content-Type': 'application/json' },
            });

            let eventData = null;
            if (response.data?.success === true && response.data?.data) {
              eventData = response.data.data;
            } else if (response.data?.data) {
              eventData = response.data.data;
            } else if (response.data?._id) {
              eventData = response.data;
            } else if (response.data?.event) {
              eventData = response.data.event;
            }

            if (eventData && eventData._id) {
              setEvent(eventData);
              return;
            }
          } catch (err) {
            lastError = err;
          }
        }

        if (lastError?.response?.status === 404) {
          setError(
            'Event not found. The event may have been deleted or moved.',
          );
        } else if (lastError?.code === 'ERR_NETWORK') {
          setError(
            'Cannot connect to server. Please make sure the backend is running.',
          );
        } else {
          setError(lastError?.message || 'Failed to load event');
        }
      } catch (error) {
        setError('An unexpected error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchEvent();
    else setError('Invalid event ID');
  }, [id]);

  const handleBooking = async () => {
    if (!event?._id) {
      toast.error('Event data is invalid');
      return;
    }
    setBooking(true);
    router.push(`/checkout?eventId=${event._id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-purple-200 rounded-full"></div>
          <div className="w-20 h-20 border-4 border-purple-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          <p className="text-center text-gray-500 mt-4">
            Loading event details...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Event Not Found
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition font-semibold"
            >
              Try Again
            </button>
            <Link
              href="/events"
              className="block w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-semibold"
            >
              Browse All Events
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!event) return null;

  const formatDate = dateString => {
    if (!dateString) return 'Date TBA';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const categories = {
    Technology: 'bg-blue-100 text-blue-700',
    Music: 'bg-purple-100 text-purple-700',
    Business: 'bg-green-100 text-green-700',
    Food: 'bg-orange-100 text-orange-700',
    Art: 'bg-pink-100 text-pink-700',
    Sports: 'bg-indigo-100 text-indigo-700',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="relative h-[70vh] md:h-[80vh] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={
              event.image ||
              'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1600'
            }
            alt={event.title}
            className="w-full h-full object-cover"
            onError={e =>
              (e.target.src =
                'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1600')
            }
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex flex-wrap gap-3 mb-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${categories[event.category] || 'bg-gray-100 text-gray-700'}`}
                >
                  {event.category || 'Event'}
                </span>
                <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white rounded-full text-sm font-semibold">
                  {new Date(event.date) > new Date()
                    ? '🟢 Upcoming'
                    : '🔴 Past Event'}
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 drop-shadow-lg">
                {event.title}
              </h1>
              <p className="text-lg md:text-xl text-white/90 max-w-2xl drop-shadow">
                {event.shortDescription}
              </p>
            </motion.div>
          </div>
        </div>

        <button
          onClick={() => router.back()}
          className="absolute top-20 left-4 md:left-8 z-10 flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-white/30 transition-all"
        >
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                About This Event
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">
                Event Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-xl">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date & Time</p>
                    <p className="font-semibold text-gray-900">
                      {formatDate(event.date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-pink-50 rounded-xl">
                  <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-pink-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-semibold text-gray-900">
                      Online / To be announced
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Tag className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Category</p>
                    <p className="font-semibold text-gray-900">
                      {event.category}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-green-50 rounded-xl">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="font-semibold text-gray-900">
                      Full Day Event
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">
                Organized by
              </h3>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
                  {event.userEmail?.charAt(0).toUpperCase() || 'E'}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {event.userEmail?.split('@')[0] || 'Event Organizer'}
                  </p>
                  <p className="text-sm text-gray-500">Event Organizer</p>
                  <div className="flex items-center gap-1 mt-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-green-600">
                      Verified Organizer
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
                  <p className="text-sm opacity-90 mb-1">Starting from</p>
                  <p className="text-4xl font-bold">${event.price}</p>
                  <p className="text-xs opacity-80 mt-1">per person</p>
                </div>
                <div className="p-6 space-y-4">
                  <button
                    onClick={handleBooking}
                    disabled={booking}
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg hover:shadow-xl transform hover:scale-[1.02] transition-all disabled:opacity-50"
                  >
                    {booking ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="animate-spin h-5 w-5"
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
                        </svg>{' '}
                        Processing...
                      </span>
                    ) : (
                      `Book Now - $${event.price}`
                    )}
                  </button>
                  <button className="w-full py-3 bg-white border-2 border-purple-600 text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-all flex items-center justify-center gap-2">
                    <Heart className="w-5 h-5" /> Add to Wishlist
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
