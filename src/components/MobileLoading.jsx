'use client';
import { useEffect, useState } from 'react';

export default function MobileLoading() {
  const [message, setMessage] = useState('Redirecting to Google...');

  useEffect(() => {
    const messages = [
      'Redirecting to Google...',
      'Please wait...',
      'Almost there...',
    ];
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % messages.length;
      setMessage(messages[index]);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="text-center p-8">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">{message}</h2>
        <p className="text-gray-500">You will be redirected automatically</p>
      </div>
    </div>
  );
}
