// app/auth/callback/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getRedirectResult } from 'firebase/auth';
import { auth } from '../../../lib/firebase.init';

export default function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const result = await getRedirectResult(auth);

        if (result) {
          console.log('Auth successful:', result.user.email);
          // Redirect to home
          router.push('/');
        } else {
          // No result, go to login
          router.push('/login');
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        setError(err.message);
        setTimeout(() => router.push('/login'), 3000);
      }
    };

    handleCallback();
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Authentication Error
          </h2>
          <p className="text-gray-600">{error}</p>
          <p className="text-gray-500 mt-4">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-700">
          Completing sign in...
        </h2>
        <p className="text-gray-500 mt-2">Please wait</p>
      </div>
    </div>
  );
}
