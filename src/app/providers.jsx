// app/layout.jsx or app/providers.jsx
'use client';
import { useEffect } from 'react';
import { auth } from '@/lib/firebase.init';
import { getRedirectResult } from 'firebase/auth';

export function Providers({ children }) {
  useEffect(() => {
    // Handle any pending redirect results on app load
    const handlePendingRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          console.log('Pending redirect result handled:', result.user.email);
          window.location.href = '/';
        }
      } catch (error) {
        console.error('Pending redirect error:', error);
      }
    };

    handlePendingRedirect();
  }, []);

  return children;
}
