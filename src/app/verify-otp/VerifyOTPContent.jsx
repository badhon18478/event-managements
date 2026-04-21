'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Mail,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function VerifyOTPContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    if (!email) {
      router.push('/forget-password');
    }
  }, [email, router]);

  useEffect(() => {
    const devCode = sessionStorage.getItem('devCode');
    if (devCode && devCode.length === 6) {
      const digits = devCode.split('');
      setOtp(digits);
      toast.success('Code auto-filled from console');
    }
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerify = async e => {
    e.preventDefault();
    const otpCode = otp.join('');

    if (otpCode.length !== 6) {
      setError('Please enter complete 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_URL}/auth/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otpCode }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        toast.success('Code verified!');
        router.push(
          `/reset-password?email=${encodeURIComponent(email)}&token=${data.resetToken}`,
        );
      } else {
        setError(data.message || 'Invalid verification code');
        toast.error(data.message || 'Invalid code');
      }
    } catch (error) {
      console.error('Verify error:', error);
      setError('Failed to verify code. Please try again.');
      toast.error('Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (timeLeft > 0) {
      toast.error(
        `Please wait ${Math.floor(timeLeft / 60)}:${timeLeft % 60} before resending`,
      );
      return;
    }

    setResendLoading(true);
    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_URL}/auth/send-verification-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setTimeLeft(300);
        if (data.devCode) {
          toast.success(`New code: ${data.devCode}`);
          sessionStorage.setItem('devCode', data.devCode);
          const digits = data.devCode.split('');
          setOtp(digits);
        } else {
          toast.success('New code sent to your email');
        }
      } else {
        toast.error(data.message || 'Failed to resend code');
      }
    } catch (error) {
      toast.error('Failed to resend code');
    } finally {
      setResendLoading(false);
    }
  };

  const formatTime = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!email) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Verify Your Email</h1>
          <p className="text-purple-100 text-sm mt-1">
            We've sent a 6-digit code to {email}
          </p>
        </div>

        <div className="p-6">
          {!success ? (
            <form
              onSubmit={handleVerify}
              className="space-y-6"
              id="verify-form"
            >
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3 text-center">
                  Enter Verification Code
                </label>
                <div className="flex justify-center gap-3">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength="1"
                      value={digit}
                      onChange={e => handleOtpChange(index, e.target.value)}
                      className="w-12 h-12 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                    />
                  ))}
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Verifying...
                  </span>
                ) : (
                  'Verify & Continue'
                )}
              </button>

              <div className="text-center">
                <p className="text-sm text-gray-500">
                  Didn't receive the code?{' '}
                  {timeLeft > 0 ? (
                    <span className="text-purple-600 font-medium">
                      Resend in {formatTime(timeLeft)}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendCode}
                      disabled={resendLoading}
                      className="text-purple-600 font-medium hover:underline disabled:opacity-50"
                    >
                      {resendLoading ? 'Sending...' : 'Resend Code'}
                    </button>
                  )}
                </p>
              </div>

              <div className="text-center pt-2">
                <a
                  href="/forget-password"
                  className="text-sm text-purple-600 hover:text-purple-700 flex items-center justify-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </a>
              </div>
            </form>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Verified!
              </h3>
              <p className="text-gray-600">Redirecting to reset password...</p>
              <div className="mt-4 h-1 w-24 bg-purple-600 rounded-full mx-auto animate-pulse"></div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
