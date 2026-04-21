// app/booking/[id]/page.jsx
'use client';

import { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
// import { AuthContext } from '@/AuthContext/AuthProvider';
import toast from 'react-hot-toast';
import { AuthContext } from '../../../AuthContext/AuthProvider';
export default function BookingPage({ params }) {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleBooking = async () => {
    if (!user) {
      toast.error('Please login first');
      router.push('/login');
      return;
    }

    setLoading(true);
    try {
      // Your booking API call here
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/bookings`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ticketId: params.id,
            quantity,
            userEmail: user.email,
          }),
        },
      );

      const data = await response.json();
      if (data.success) {
        toast.success('Booking successful!');
        router.push('/dashboard/my-bookings');
      }
    } catch (error) {
      toast.error('Booking failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Book Ticket</h1>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Quantity</label>
          <input
            type="number"
            min="1"
            max="10"
            value={quantity}
            onChange={e => setQuantity(parseInt(e.target.value))}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
        <button
          onClick={handleBooking}
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Confirm Booking'}
        </button>
      </div>
    </div>
  );
}
