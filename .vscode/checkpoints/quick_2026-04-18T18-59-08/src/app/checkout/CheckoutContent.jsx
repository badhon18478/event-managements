'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { stripePromise } from '@/lib/stripe';
import { useAuth } from '@/AuthContext/AuthProvider';
import { Loader2, ArrowLeft, CreditCard, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

function CheckoutForm({ eventId, amount, eventTitle }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const { user } = useAuth();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();

    if (!stripe || !elements) {
      toast.error('Payment system not ready');
      return;
    }

    setProcessing(true);

    try {
      const { error: submitError, paymentIntent } = await stripe.confirmPayment(
        {
          elements,
          confirmParams: {
            return_url: `${window.location.origin}/payment/success`,
          },
          redirect: 'if_required',
        },
      );

      if (submitError) {
        setError(submitError.message);
        toast.error(submitError.message);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        const token = await user.getIdToken();
        const API_URL =
          process.env.NEXT_PUBLIC_API_URL ||
          'https://event-managements-server-chi.vercel.app/api';

        await fetch(`${API_URL}/api/payments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id,
            eventId: eventId,
            eventTitle: eventTitle,
            amount: amount,
            status: 'succeeded',
          }),
        });

        toast.success('Payment successful!');
        router.push('/payment/success');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          Event: <span className="font-semibold">{eventTitle}</span>
        </p>
        <p className="text-lg font-bold text-purple-600">Total: ${amount}</p>
      </div>

      <PaymentElement />

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg disabled:opacity-50 font-semibold text-lg transition-all"
      >
        {processing ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Processing...
          </span>
        ) : (
          `Pay $${amount}`
        )}
      </button>
    </form>
  );
}

export default function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [clientSecret, setClientSecret] = useState(null);
  const [loading, setLoading] = useState(true);
  const [eventDetails, setEventDetails] = useState(null);

  const eventId = searchParams.get('eventId');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!eventId) {
      toast.error('No event selected');
      router.push('/events');
      return;
    }

    initializePayment();
  }, [eventId, user]);

  const initializePayment = async () => {
    try {
      setLoading(true);

      const API_URL =
        process.env.NEXT_PUBLIC_API_URL ||
        'https://event-managements-server-chi.vercel.app/api';

      console.log(
        '📡 Fetching event from:',
        `${API_URL}/api/events/${eventId}`,
      );

      // Get event details
      const eventRes = await fetch(`${API_URL}/api/events/${eventId}`);
      const eventData = await eventRes.json();
      const event = eventData.data || eventData;
      setEventDetails(event);

      // Create payment intent
      const token = await user.getIdToken();
      const response = await fetch(`${API_URL}/api/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          eventId: eventId,
          eventTitle: event.title,
          amount: event.price,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Payment initialization failed');
      }

      setClientSecret(data.clientSecret);
    } catch (error) {
      console.error('❌ Error:', error);
      toast.error(error.message);
      router.push('/events');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-purple-200 rounded-full"></div>
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          <p className="text-center text-gray-500 mt-4">
            Preparing checkout...
          </p>
        </div>
      </div>
    );
  }

  if (!clientSecret || !eventDetails) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-purple-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Event
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Order Summary
              </h2>

              <div className="flex gap-4 pb-4 border-b">
                <img
                  src={eventDetails.image}
                  alt={eventDetails.title}
                  className="w-20 h-20 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {eventDetails.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {eventDetails.category}
                  </p>
                </div>
              </div>

              <div className="py-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Ticket Price</span>
                  <span className="font-semibold">${eventDetails.price}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-bold text-purple-600 text-lg">
                    ${eventDetails.price}
                  </span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-gray-50 rounded-lg flex items-center gap-2 text-xs text-gray-500">
                <Shield className="w-4 h-4" />
                Secure payment powered by Stripe
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 order-1 lg:order-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Complete Payment
                  </h1>
                  <p className="text-sm text-gray-500">
                    Enter your card details
                  </p>
                </div>
              </div>

              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm
                  eventId={eventId}
                  amount={eventDetails.price}
                  eventTitle={eventDetails.title}
                />
              </Elements>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
