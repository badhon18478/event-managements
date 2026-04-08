'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/AuthContext/AuthProvider';

export default function CheckoutButton({ event }) {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const handlePayment = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    setLoading(true);

    try {
      // ভেরিফাই করুন আপনার ব্যাকএন্ড URL সঠিক
      const API_URL = 'https://event-managements-server-chi.vercel.app/api';

      console.log(
        'Sending payment request to:',
        `${API_URL}/create-payment-intent`,
      );

      const token = await user.getIdToken();

      const response = await fetch(`${API_URL}/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          eventId: event._id,
          amount: event.price,
        }),
      });

      console.log('Response status:', response.status);

      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Payment failed');
      }

      // সঠিক চেকআউট পৃষ্ঠায় রিডাইরেক্ট
      router.push(`/payment/checkout?clientSecret=${data.clientSecret}`);
    } catch (error) {
      console.error('Payment error:', error);
      alert(error.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all font-semibold disabled:opacity-50"
    >
      {loading ? 'Processing...' : `Book Now - $${event.price}`}
    </button>
  );
}
