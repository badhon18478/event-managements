// src/app/events/[id]/EventDetailsClient.jsx
'use client';

import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
// import { AuthContext } from '@/AuthContext/AuthProvider';
import { AuthContext } from '../../AuthContext/AuthProvider';
import toast from 'react-hot-toast';
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  CreditCard,
  Shield,
  ChevronLeft,
  Ticket,
  AlertCircle,
} from 'lucide-react';

export default function EventDetailsClient({ ticketId }) {
  const { user, userRole } = useContext(AuthContext);
  const router = useRouter();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        setLoading(true);
        console.log('Fetching ticket ID:', ticketId);

        const response = await fetch(`${API_URL}/api/tickets/${ticketId}`);
        const data = await response.json();

        console.log('Response:', data);

        if (data.success && data.ticket) {
          setTicket(data.ticket);
        } else {
          setError('Ticket not found');
        }
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to load ticket');
      } finally {
        setLoading(false);
      }
    };

    if (ticketId) {
      fetchTicket();
    }
  }, [ticketId, API_URL]);

  const handleBooking = async () => {
    if (!user) {
      toast.error('Please login first');
      router.push(`/login?from=/events/${ticketId}`);
      return;
    }

    setBookingLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: ticketId,
          quantity: quantity,
          userEmail: user.email,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Booking successful!');
        router.push('/dashboard/my-bookings');
      } else {
        toast.error(data.message || 'Booking failed');
      }
    } catch (error) {
      toast.error('Booking failed');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading ticket details...</p>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error || 'Ticket not found'}</p>
          <button
            onClick={() => router.push('/events')}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 mb-6"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="relative h-96 w-full">
                <Image
                  src={ticket.image || 'https://via.placeholder.com/800x400'}
                  alt={ticket.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="p-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {ticket.title}
                </h1>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-indigo-600" />
                    <div>
                      <p className="text-sm text-gray-500">From</p>
                      <p className="font-semibold">{ticket.from}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-indigo-600" />
                    <div>
                      <p className="text-sm text-gray-500">To</p>
                      <p className="font-semibold">{ticket.to}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="font-semibold">
                        {new Date(
                          ticket.departureDateTime,
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-indigo-600" />
                    <div>
                      <p className="text-sm text-gray-500">Time</p>
                      <p className="font-semibold">
                        {new Date(
                          ticket.departureDateTime,
                        ).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    About this trip
                  </h3>
                  <p className="text-gray-600">
                    Experience a comfortable journey with {ticket.vendorName}.
                    This {ticket.transportType} service offers a safe and
                    reliable travel experience.
                  </p>
                </div>

                {ticket.perks && ticket.perks.length > 0 && (
                  <div className="border-t pt-4 mt-4">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Amenities
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {ticket.perks.map((perk, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                        >
                          {perk}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <div className="text-center mb-6">
                <p className="text-4xl font-bold text-indigo-600">
                  ৳{ticket.price}
                </p>
                <p className="text-gray-500">per person</p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Tickets
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 border-2 rounded-lg flex items-center justify-center hover:border-indigo-600"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={e =>
                      setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    className="w-20 text-center py-2 border-2 rounded-lg"
                  />
                  <button
                    onClick={() =>
                      setQuantity(Math.min(ticket.ticketQuantity, quantity + 1))
                    }
                    className="w-10 h-10 border-2 rounded-lg flex items-center justify-center hover:border-indigo-600"
                  >
                    +
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {ticket.ticketQuantity} tickets available
                </p>
              </div>

              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between mb-2">
                  <span>Total</span>
                  <span className="font-bold text-xl">
                    ৳{ticket.price * quantity}
                  </span>
                </div>
              </div>

              <button
                onClick={handleBooking}
                disabled={bookingLoading || ticket.ticketQuantity === 0}
                className={`w-full py-3 rounded-xl font-bold text-white transition ${
                  bookingLoading || ticket.ticketQuantity === 0
                    ? 'bg-gray-400'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg'
                }`}
              >
                {bookingLoading
                  ? 'Processing...'
                  : ticket.ticketQuantity === 0
                    ? 'Sold Out'
                    : 'Book Now'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
