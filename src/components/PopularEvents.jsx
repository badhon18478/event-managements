'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';

export default function PopularEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        const API_URL =
          process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        // Try multiple endpoints
        const endpoints = [
          `${API_URL}/api/events/latest`,
          `${API_URL}/api/events?limit=6`,
          `${API_URL}/api/events`,
        ];

        let eventsData = [];
        let success = false;

        for (const endpoint of endpoints) {
          try {
            console.log('📡 Trying:', endpoint);
            const response = await axios.get(endpoint);

            // Handle different response formats
            if (Array.isArray(response.data)) {
              eventsData = response.data.slice(0, 6);
              success = true;
              break;
            } else if (
              response.data?.data &&
              Array.isArray(response.data.data)
            ) {
              eventsData = response.data.data.slice(0, 6);
              success = true;
              break;
            } else if (
              response.data?.events &&
              Array.isArray(response.data.events)
            ) {
              eventsData = response.data.events.slice(0, 6);
              success = true;
              break;
            }
          } catch (err) {
            console.log(`Failed on ${endpoint}:`, err.message);
          }
        }

        if (!success) {
          throw new Error('No working endpoint found');
        }

        console.log('✅ Popular events loaded:', eventsData.length);
        setEvents(eventsData);
      } catch (error) {
        console.error('❌ Error fetching popular events:', error);
        setError(error.message);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-gray-500 mt-3">Loading popular events...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">Popular events will appear here soon!</p>
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">No events available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Popular Events
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover the most trending events happening near you
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map(event => (
            <Link
              key={event._id || event.id}
              href={`/events/${event._id || event.id}`}
              className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={
                    event.image ||
                    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'
                  }
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={e => {
                    e.target.src =
                      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800';
                  }}
                />
                <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm font-bold text-purple-600 shadow-lg">
                  ${event.price}
                </div>
                <div className="absolute bottom-4 left-4">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-purple-600 text-xs font-semibold rounded-full">
                    {event.category}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span>{new Date(event.date).toLocaleDateString()}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors line-clamp-1">
                  {event.title}
                </h3>
                <p className="text-gray-600 line-clamp-2">
                  {event.shortDescription}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
