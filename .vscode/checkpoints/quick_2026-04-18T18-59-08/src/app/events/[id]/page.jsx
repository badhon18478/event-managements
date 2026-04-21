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
  Share2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function EventDetailsPage({ params }) {
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

        const API_URL =
          process.env.NEXT_PUBLIC_API_URL ||
          'https://event-managements-server-chi.vercel.app/api';
        const fullUrl = `${API_URL}/api/events/${id}`;

        console.log('📡 Fetching from:', fullUrl);

        const response = await axios.get(fullUrl, {
          timeout: 10000,
          headers: { 'Content-Type': 'application/json' },
        });

        console.log('📦 Response:', response.data);

        // Handle different response formats
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
          console.log('✅ Event loaded:', eventData.title);
          setEvent(eventData);
        } else {
          setError('Event not found');
        }
      } catch (error) {
        console.error('❌ Error:', error);
        if (error.code === 'ERR_NETWORK') {
          setError('Cannot connect to server. Please check your connection.');
        } else if (error.response?.status === 404) {
          setError('Event not found');
        } else {
          setError(error.message || 'Something went wrong');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEvent();
    }
  }, [id]);

  const handleBooking = () => {
    console.log('🟢 Book Now clicked!');
    console.log('Event object:', event);
    console.log('Event ID:', event?._id);

    if (!event?._id) {
      toast.error('Event data is invalid');
      return;
    }

    setBooking(true);
    // সঠিকভাবে checkout পেজে redirect
    router.push(`/checkout?eventId=${event._id}`);
  };
  // Loading State
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

  // Error State
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

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Event Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The event you're looking for doesn't exist.
          </p>
          <Link
            href="/events"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition font-semibold"
          >
            Browse Events
          </Link>
        </div>
      </div>
    );
  }

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
      {/* Hero Section */}
      <div className="relative h-[70vh] md:h-[80vh] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={
              event.image ||
              'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1600'
            }
            alt={event.title}
            className="w-full h-full object-cover"
            onError={e => {
              e.target.src =
                'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1600';
            }}
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

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6 md:p-8"
            >
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                About This Event
              </h2>
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {event.description}
                </p>
              </div>
            </motion.div>

            {/* Event Details Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6 md:p-8"
            >
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">
                Event Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-xl">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
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
                  <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center flex-shrink-0">
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
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
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
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
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
            </motion.div>

            {/* Organizer Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-6 md:p-8"
            >
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
            </motion.div>
          </div>

          {/* Sidebar - Booking Card */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="sticky top-24"
            >
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
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      `Book Now - $${event.price}`
                    )}
                  </button>

                  <button className="w-full py-3 bg-white border-2 border-purple-600 text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-all flex items-center justify-center gap-2">
                    <Heart className="w-5 h-5" />
                    Add to Wishlist
                  </button>

                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600 mb-3">
                      Share this event
                    </p>
                    <div className="flex gap-3">
                      <button className="flex-1 py-2 bg-[#1877f2] text-white rounded-lg hover:bg-[#1877f2]/90 transition flex items-center justify-center gap-2">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                        Facebook
                      </button>
                      <button className="flex-1 py-2 bg-[#1da1f2] text-white rounded-lg hover:bg-[#1da1f2]/90 transition flex items-center justify-center gap-2">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                        </svg>
                        Twitter
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Info */}
              <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Quick Info</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Views</span>
                    <span className="font-semibold text-gray-900">1.2k</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Interested</span>
                    <span className="font-semibold text-gray-900">345</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Booked</span>
                    <span className="font-semibold text-purple-600">89</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
