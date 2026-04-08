'use client';

export default function LoadingSpinner({
  size = 'medium',
  text = 'Loading...',
}) {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-10 h-10',
    large: 'w-16 h-16',
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative">
        <div
          className={`${sizeClasses[size]} border-4 border-purple-200 rounded-full`}
        ></div>
        <div
          className={`${sizeClasses[size]} border-4 border-purple-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0`}
        ></div>
      </div>
      {text && <p className="mt-4 text-gray-500 text-sm">{text}</p>}
    </div>
  );
}
