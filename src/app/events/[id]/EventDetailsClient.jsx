// src/app/events/[id]/EventDetailsClient.jsx
'use client';

import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { AuthContext } from '../../AuthContext/AuthProvider';
import toast from 'react-hot-toast';
import {
  Calendar,
  MapPin,
  Clock,
  ChevronLeft,
  AlertCircle,
  Wifi,
  Coffee,
  Wind,
  Shield,
} from 'lucide-react';

// ✅ সঠিক API URL (মোবাইল ও ডেস্কটপের জন্য)
const getApiUrl = () => {
  // প্রোডাকশন URL (Vercel)
  const PROD_URL = 'https://event-managements-server-chi.vercel.app';
  const LOCAL_URL = 'http://localhost:5000';

  // ক্লায়েন্ট সাইডে চেক করা
  if (typeof window !== 'undefined') {
    // মোবাইল চেক
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      console.log('📱 Mobile device detected, using production API');
      return PROD_URL;
    }
  }

  // এনভায়রনমেন্ট ভেরিয়েবল বা প্রোডাকশন URL
  return process.env.NEXT_PUBLIC_API_URL || PROD_URL;
};

export default function EventDetailsClient({ ticketId }) {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [networkError, setNetworkError] = useState(false);

  const API_URL = getApiUrl();

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        setLoading(true);
        setNetworkError(false);
        console.log('🔄 Fetching ticket ID:', ticketId);
        console.log('📍 API URL:', API_URL);

        // ✅ টাইমআউট সেট করা (মোবাইলের জন্য)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const response = await fetch(`${API_URL}/api/tickets/${ticketId}`, {
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        console.log('📦 Response:', data);

        if (data.success && data.ticket) {
          setTicket(data.ticket);
        } else {
          setError(data.message || 'Ticket not found');
        }
      } catch (err) {
        console.error('❌ Fetch error:', err);

        if (err.name === 'AbortError') {
          setError('Request timeout. Please check your internet connection.');
          setNetworkError(true);
        } else {
          setError(err.message || 'Failed to load ticket');
        }

        toast.error('Failed to load ticket details');
      } finally {
        setLoading(false);
      }
    };

    if (ticketId) {
      fetchTicket();
    }
  }, [ticketId, API_URL]);

  const handleBooking = async () => {
    // ✅ ইউজার লগইন চেক
    if (!user) {
      toast.error('Please login first');
      router.push(`/login?from=/events/${ticketId}`);
      return;
    }

    // ✅ লোডিং স্টার্ট
    setBookingLoading(true);
    setNetworkError(false);

    // ✅ টাইমআউট সেট করা
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    try {
      console.log('📡 Sending booking request...');
      console.log('📍 API URL:', `${API_URL}/api/bookings`);
      console.log('📦 Payload:', {
        ticketId,
        quantity,
        userEmail: user.email,
      });

      const response = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticketId: ticketId,
          quantity: quantity,
          userEmail: user.email,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('📦 Booking response:', data);

      if (data.success) {
        toast.success('Booking successful! 🎉');

        // ✅ সফল বুকিং হলে রিডাইরেক্ট
        setTimeout(() => {
          router.push('/dashboard/my-bookings');
        }, 1000);
      } else {
        throw new Error(data.message || 'Booking failed');
      }
    } catch (error) {
      console.error('❌ Booking error:', error);

      let errorMessage = 'Booking failed. Please try again.';

      if (error.name === 'AbortError') {
        errorMessage = 'Request timeout. Please check your connection.';
        setNetworkError(true);
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Network error. Please check your internet connection.';
        setNetworkError(true);
      } else {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setBookingLoading(false);
      clearTimeout(timeoutId);
    }
  };

  // ✅ রিট্রাই ফাংশন
  const handleRetry = () => {
    setError(null);
    setNetworkError(false);
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">
            Loading ticket details...
          </p>
          <p className="text-sm text-gray-400 mt-2">Please wait</p>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-600 mb-6">{error || 'Ticket not found'}</p>
          {networkError && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                💡 Check your internet connection and try again
              </p>
            </div>
          )}
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleRetry}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push('/events')}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Back to Events
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-8">
        {/* Back Button - মোবাইলের জন্য বড় করা */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 mb-4 md:mb-6 transition-colors p-2 -ml-2"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="font-medium">Back</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Image Container - মোবাইলের জন্য ছোট করা */}
              <div className="relative h-64 md:h-96 w-full bg-gray-200">
                {ticket.image ? (
                  <Image
                    src={ticket.image}
                    alt={ticket.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 800px"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-500">
                    <span className="text-white text-2xl font-bold">
                      EventHub
                    </span>
                  </div>
                )}
              </div>

              <div className="p-4 md:p-6">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  {ticket.title}
                </h1>

                {/* গ্রিড - মোবাইলে 1 কলাম */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">From</p>
                      <p className="font-semibold text-gray-900">
                        {ticket.from}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">To</p>
                      <p className="font-semibold text-gray-900">{ticket.to}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Date</p>
                      <p className="font-semibold text-gray-900">
                        {ticket.departureDateTime
                          ? new Date(
                              ticket.departureDateTime,
                            ).toLocaleDateString('en-BD')
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Clock className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Time</p>
                      <p className="font-semibold text-gray-900">
                        {ticket.departureDateTime
                          ? new Date(
                              ticket.departureDateTime,
                            ).toLocaleTimeString('en-BD', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    About this trip
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Experience a comfortable journey with{' '}
                    {ticket.vendorName || 'EventHub'}. This{' '}
                    {ticket.transportType || 'bus'} service offers a safe and
                    reliable travel experience.
                  </p>
                </div>

                {ticket.perks && ticket.perks.length > 0 && (
                  <div className="border-t pt-4 mt-4">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Amenities
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {ticket.perks.map((perk, idx) => {
                        const Icon =
                          perk === 'WiFi'
                            ? Wifi
                            : perk === 'Snacks'
                              ? Coffee
                              : perk === 'AC'
                                ? Wind
                                : Shield;
                        return (
                          <span
                            key={idx}
                            className="px-3 py-1.5 bg-gray-100 rounded-full text-sm flex items-center gap-1"
                          >
                            {Icon && <Icon className="w-3 h-3" />}
                            {perk}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Booking Card (মোবাইলে স্টিকি) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-5 md:p-6 sticky top-4 md:top-24">
              <div className="text-center mb-6">
                <p className="text-3xl md:text-4xl font-bold text-indigo-600">
                  ৳{ticket.price?.toLocaleString() || ticket.price}
                </p>
                <p className="text-gray-500 text-sm">per person</p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Number of Tickets
                </label>
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={bookingLoading}
                    className="w-12 h-12 border-2 rounded-xl flex items-center justify-center hover:border-indigo-600 disabled:opacity-50 transition-colors text-xl font-bold"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={e =>
                      setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    className="w-20 text-center py-3 border-2 rounded-xl text-lg font-semibold"
                    disabled={bookingLoading}
                  />
                  <button
                    onClick={() =>
                      setQuantity(Math.min(ticket.ticketQuantity, quantity + 1))
                    }
                    disabled={bookingLoading}
                    className="w-12 h-12 border-2 rounded-xl flex items-center justify-center hover:border-indigo-600 disabled:opacity-50 transition-colors text-xl font-bold"
                  >
                    +
                  </button>
                </div>
                <p className="text-sm text-gray-500 text-center mt-3">
                  {ticket.ticketQuantity} tickets available
                </p>
              </div>

              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Amount</span>
                  <span className="font-bold text-2xl text-indigo-600">
                    ৳{(ticket.price * quantity).toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={handleBooking}
                disabled={bookingLoading || ticket.ticketQuantity === 0}
                className={`w-full py-4 rounded-xl font-bold text-white transition-all duration-200 ${
                  bookingLoading || ticket.ticketQuantity === 0
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg active:scale-98'
                }`}
              >
                {bookingLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </span>
                ) : ticket.ticketQuantity === 0 ? (
                  'Sold Out'
                ) : (
                  'Book Now'
                )}
              </button>

              {/* সিকিউরিটি মেসেজ */}
              <p className="text-xs text-gray-400 text-center mt-4 flex items-center justify-center gap-1">
                <Shield className="w-3 h-3" />
                Secure booking guaranteed
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
