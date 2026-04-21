import { Suspense } from 'react';
import VerifyOTPContent from './VerifyOTPContent';

function VerifyOTPFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-purple-200 rounded-full"></div>
        <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        <p className="text-center text-gray-500 mt-4">Loading...</p>
      </div>
    </div>
  );
}

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={<VerifyOTPFallback />}>
      <VerifyOTPContent />
    </Suspense>
  );
}
