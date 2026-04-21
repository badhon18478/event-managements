'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Send, AlertCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgetPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSendCode = async e => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);

    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

      console.log(
        '📡 Sending request to:',
        `${API_URL}/api/auth/send-verification-code`,
      );

      const response = await fetch(
        `${API_URL}/api/auth/send-verification-code`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        },
      );

      const data = await response.json();
      console.log('📦 Response:', data);

      if (response.ok && data.success) {
        setSuccess(true);

        // Show code in toast if available (development)
        if (data.devCode) {
          toast.success(`Your verification code: ${data.devCode}`, {
            duration: 10000,
            style: {
              background: '#4F46E5',
              color: 'white',
              fontSize: '16px',
              fontWeight: 'bold',
            },
          });
        } else {
          toast.success('Verification code sent to your email!');
        }

        // Store for auto-fill
        if (data.devCode) {
          sessionStorage.setItem('devCode', data.devCode);
        }
        sessionStorage.setItem('resetEmail', email);

        setTimeout(() => {
          router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
        }, 1500);
      } else {
        setError(data.message || 'Failed to send code');
        toast.error(data.message || 'Failed to send code');
      }
    } catch (error) {
      console.error('Send code error:', error);
      setError(
        'Cannot connect to server. Make sure backend is running on port 5000',
      );
      toast.error('Backend server not running');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 py-16">
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Reset Your Password
          </h1>
          <p className="text-lg text-white/90">
            Enter your email to receive a verification code
          </p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="p-8">
            {!success ? (
              <form onSubmit={handleSendCode} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                      placeholder="Enter your email address"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    We'll send a 6-digit verification code to this email
                  </p>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl font-bold text-white transition-all bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Send className="w-5 h-5" />
                      Send Verification Code
                    </span>
                  )}
                </button>

                <div className="text-center pt-2">
                  <a
                    href="/login"
                    className="text-sm text-purple-600 hover:text-purple-700 flex items-center justify-center gap-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Login
                  </a>
                </div>
              </form>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-green-600"
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
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Code Sent!
                </h3>
                <p className="text-gray-600 mb-4">
                  We've sent a verification code to {email}
                </p>
                <div className="h-1 w-24 bg-purple-600 rounded-full mx-auto animate-pulse"></div>
                <p className="text-sm text-gray-500 mt-4">
                  Redirecting to verification page...
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
