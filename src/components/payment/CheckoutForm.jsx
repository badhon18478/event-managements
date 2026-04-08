'use client';

import { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function CheckoutForm({ event, user, onSuccess, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  const handleSubmit = async e => {
    e.preventDefault();

    if (!stripe || !elements) {
      toast.error('Stripe not initialized');
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      // Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        setPaymentError(error.message);
        onError?.(error.message);
        toast.error(error.message);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        console.log('✅ Payment succeeded:', paymentIntent.id);

        // Save payment to database
        const paymentData = {
          paymentIntentId: paymentIntent.id,
          eventId: event._id,
          eventTitle: event.title,
          amount: event.price,
          userId: user.uid,
          userEmail: user.email,
          status: 'succeeded',
        };

        console.log('💾 Saving payment:', paymentData);

        const saveResponse = await fetch('/api/payments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${await user.getIdToken()}`,
          },
          body: JSON.stringify(paymentData),
        });

        const saveResult = await saveResponse.json();

        if (!saveResponse.ok) {
          console.error('Save failed:', saveResult);
          toast.error('Payment saved but failed to record history');
        } else {
          console.log('✅ Payment saved to database:', saveResult);
          toast.success('Payment successful!');
        }

        onSuccess?.(paymentIntent);

        // Redirect to success page
        setTimeout(() => {
          router.push('/payment/success');
        }, 1500);
      }
    } catch (err) {
      console.error('Payment error:', err);
      setPaymentError(err.message);
      onError?.(err.message);
      toast.error(err.message || 'Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          Event: <span className="font-semibold">{event.title}</span>
        </p>
        <p className="text-lg font-bold text-purple-600">
          Total: ${event.price}
        </p>
      </div>

      <PaymentElement />

      {paymentError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {paymentError}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold disabled:opacity-50"
      >
        {isProcessing ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
          `Pay $${event.price}`
        )}
      </button>
    </form>
  );
}
