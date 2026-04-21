'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { useAuth } from '../../AuthContext/AuthProvider';
import {
  Loader2,
  ArrowLeft,
  CreditCard,
  Shield,
  WifiOff,
  RefreshCw,
  Lock,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

// Stripe পাবলিশেবল কী
const STRIPE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';

// ===============================
// পেমেন্ট ফর্ম কম্পোনেন্ট
// ===============================
function PaymentForm({ eventId, amount, eventTitle, onSuccess, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const { user } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [isReady, setIsReady] = useState(false);

  // Stripe এবং Elements রেডি কিনা চেক করুন
  useEffect(() => {
    if (stripe && elements) {
      setIsReady(true);
      console.log('✅ Payment form ready');
    }
  }, [stripe, elements]);

  const handleSubmit = async e => {
    e.preventDefault();

    if (!isReady) {
      toast.error('Payment form is initializing. Please wait...');
      return;
    }

    setProcessing(true);
    setPaymentError(null);

    try {
      const { error: confirmError, paymentIntent } =
        await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: `${window.location.origin}/payment/success`,
          },
          redirect: 'if_required',
        });

      if (confirmError) {
        throw new Error(confirmError.message);
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        const API_URL =
          process.env.NEXT_PUBLIC_API_URL ||
          'https://event-managements-server-chi.vercel.app';
        const token = await user.getIdToken();

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

        toast.success('Payment successful! 🎉');
        router.push('/payment/success');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setPaymentError(err.message);
      toast.error(err.message);
      if (onError) onError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* ইভেন্ট সারাংশ */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs text-purple-600 font-semibold uppercase tracking-wide">
            Event
          </span>
        </div>
        <h3 className="font-bold text-gray-900 text-base mb-3 line-clamp-2">
          {eventTitle}
        </h3>
        <div className="pt-3 border-t border-purple-100">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-sm">Total Amount</span>
            <span className="text-2xl font-bold text-purple-600">
              ${amount}
            </span>
          </div>
        </div>
      </div>

      {/* কার্ড ডিটেইলস */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center gap-2 p-4 border-b border-gray-100 bg-gray-50">
          <CreditCard className="w-4 h-4 text-purple-600" />
          <span className="font-semibold text-gray-700 text-sm">
            Card Details
          </span>
        </div>
        <div className="p-4">
          <PaymentElement />
        </div>
      </div>

      {/* স্ট্যাটাস মেসেজ */}
      {!isReady && (
        <div className="flex items-center justify-center gap-2 p-3 bg-blue-50 rounded-xl">
          <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
          <span className="text-sm text-blue-600">
            Initializing secure form...
          </span>
        </div>
      )}

      {/* এরর মেসেজ */}
      {paymentError && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
          <span className="text-sm text-red-600">{paymentError}</span>
        </div>
      )}

      {/* পে বাটন */}
      <button
        type="submit"
        disabled={!isReady || processing}
        className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-200 ${
          !isReady || processing
            ? 'bg-gray-300 cursor-not-allowed opacity-60'
            : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg active:scale-98'
        } text-white`}
        style={{ touchAction: 'manipulation' }}
      >
        {processing ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Processing...
          </span>
        ) : !isReady ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Lock className="w-4 h-4" />
            Pay ${amount} Securely
          </span>
        )}
      </button>

      {/* সিকিউরিটি ব্যাজ */}
      <div className="flex items-center justify-center gap-2 pt-2">
        <Shield className="w-3 h-3 text-gray-400" />
        <span className="text-xs text-gray-400">256-bit SSL Secure</span>
        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
        <span className="text-xs text-gray-400">Powered by Stripe</span>
      </div>
    </form>
  );
}

// ===============================
// লোডিং স্কেলেটন
// ===============================
function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 px-4">
      <div className="max-w-md mx-auto">
        {/* ব্যাক বাটন স্কেলেটন */}
        <div className="h-8 w-24 bg-gray-200 rounded-lg mb-6 animate-pulse"></div>

        {/* মেইন কার্ড স্কেলেটন */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-purple-100 to-pink-100 animate-pulse"></div>
          <div className="p-6 space-y-5">
            <div className="h-24 bg-gray-100 rounded-xl animate-pulse"></div>
            <div className="h-48 bg-gray-100 rounded-xl animate-pulse"></div>
            <div className="h-14 bg-gray-100 rounded-xl animate-pulse"></div>
          </div>
        </div>

        <p className="text-center text-gray-400 text-sm mt-6 animate-pulse">
          Loading secure checkout...
        </p>
      </div>
    </div>
  );
}

// ===============================
// এরর স্টেট
// ===============================
function ErrorState({ message, onRetry }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <WifiOff className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Unable to Load Page
        </h2>
        <p className="text-gray-500 mb-6">
          {message || 'Something went wrong'}
        </p>
        <button
          onClick={onRetry}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 mx-auto transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    </div>
  );
}

// ===============================
// মেইন চেকআউট কম্পোনেন্ট
// ===============================
export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const [stripePromise, setStripePromise] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [eventDetails, setEventDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const eventId = searchParams.get('eventId');
  const initializedRef = useRef(false);

  // 1. Stripe লোড করুন
  useEffect(() => {
    const loadStripe = async () => {
      try {
        if (!STRIPE_PUBLISHABLE_KEY) {
          throw new Error(
            'Stripe key is missing. Please check environment variables.',
          );
        }
        const stripe = await loadStripe(STRIPE_PUBLISHABLE_KEY);
        setStripePromise(() => stripe);
        console.log('✅ Stripe loaded');
      } catch (err) {
        console.error('Stripe error:', err);
        setError(err.message);
      }
    };
    loadStripe();
  }, []);

  // 2. ইউজার চেক
  useEffect(() => {
    if (user === undefined) return;

    if (!user) {
      router.push(`/login?redirect=/checkout?eventId=${eventId}`);
    }
  }, [user, eventId, router]);

  // 3. ইভেন্ট আইডি চেক
  useEffect(() => {
    if (!eventId) {
      toast.error('No event selected');
      router.push('/events');
    }
  }, [eventId, router]);

  // 4. পেমেন্ট ইনিশিয়ালাইজ
  useEffect(() => {
    if (eventId && user && !initializedRef.current && stripePromise) {
      initializedRef.current = true;
      initializePayment();
    }
  }, [eventId, user, stripePromise]);

  const initializePayment = async () => {
    try {
      setLoading(true);
      setError(null);

      const API_URL =
        process.env.NEXT_PUBLIC_API_URL ||
        'https://event-managements-server-chi.vercel.app';

      console.log('📡 Fetching event:', `${API_URL}/api/events/${eventId}`);

      // ইভেন্ট ডিটেইলস আনুন
      const eventRes = await fetch(`${API_URL}/api/events/${eventId}`);

      if (!eventRes.ok) {
        throw new Error(`Failed to load event (${eventRes.status})`);
      }

      const eventData = await eventRes.json();
      const event = eventData.data || eventData;

      if (!event || !event.price) {
        throw new Error('Invalid event data');
      }

      setEventDetails(event);
      console.log('✅ Event loaded:', event.title);

      // পেমেন্ট ইনটেন্ট ক্রিয়েট করুন
      const token = await user.getIdToken();

      const paymentRes = await fetch(`${API_URL}/api/create-payment-intent`, {
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

      const paymentData = await paymentRes.json();

      if (!paymentRes.ok) {
        throw new Error(paymentData.message || 'Payment initialization failed');
      }

      if (!paymentData.clientSecret) {
        throw new Error('No client secret received');
      }

      setClientSecret(paymentData.clientSecret);
      console.log('✅ Payment intent created');
    } catch (err) {
      console.error('❌ Error:', err);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    initializedRef.current = false;
    setError(null);
    setLoading(true);
    initializePayment();
  };

  // লোডিং স্টেট
  if (loading || !stripePromise) {
    return <LoadingSkeleton />;
  }

  // এরর স্টেট
  if (error) {
    return <ErrorState message={error} onRetry={handleRetry} />;
  }

  // ক্লায়েন্ট সিক্রেট না থাকলে
  if (!clientSecret || !eventDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-500">Preparing checkout...</p>
        </div>
      </div>
    );
  }

  // চেকআউট ফর্ম দেখান
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-4 px-4">
      <div className="max-w-md mx-auto">
        {/* ব্যাক বাটন */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-purple-600 mb-4 transition-colors py-2 px-1"
          style={{ touchAction: 'manipulation' }}
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Back to Event</span>
        </button>

        {/* চেকআউট কার্ড */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* হেডার */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-8 text-white text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <CreditCard className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold">Complete Payment</h1>
            <p className="text-white/80 text-sm mt-1">Secure checkout</p>
          </div>

          {/* ফর্ম */}
          <div className="p-6">
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <PaymentForm
                eventId={eventId}
                amount={eventDetails.price}
                eventTitle={eventDetails.title}
              />
            </Elements>
          </div>
        </div>

        {/* হেল্প টেক্সট */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Need help? Contact support@eventhub.com
        </p>
      </div>
    </div>
  );
}
