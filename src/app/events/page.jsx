'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { Calendar, Search, AlertCircle } from 'lucide-react';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    'all',
    'Technology',
    'Music',
    'Business',
    'Food',
    'Art',
    'Sports',
  ];

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use the correct API URL - remove /api if your backend doesn't have it
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const fullUrl = `${API_URL}/api/events`;

      console.log('📡 Fetching events from:', fullUrl);

      const response = await axios.get(fullUrl);
      console.log('✅ Response:', response.data);

      // Handle response data
      let eventsData = [];
      if (Array.isArray(response.data)) {
        eventsData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        eventsData = response.data.data;
      } else if (response.data?.events && Array.isArray(response.data.events)) {
        eventsData = response.data.events;
      }

      setEvents(eventsData);
      setFilteredEvents(eventsData);
    } catch (error) {
      console.error('❌ Error fetching events:', error);

      if (error.code === 'ERR_NETWORK') {
        setError(
          '❌ Cannot connect to server. Please start the backend on port 5000',
        );
      } else if (error.response?.status === 404) {
        setError(
          '❌ API endpoint not found. Please check if backend has /api/events route',
        );
      } else if (error.response?.status === 503) {
        setError('❌ Database connection failed. Please check MongoDB');
      } else {
        setError(error.message || 'Failed to load events');
      }

      setEvents([]);
      setFilteredEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter events
  useEffect(() => {
    const eventsArray = Array.isArray(events) ? events : [];
    let filtered = [...eventsArray];

    if (searchTerm) {
      filtered = filtered.filter(
        event =>
          event?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event?.shortDescription
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()),
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(event => event?.category === selectedCategory);
    }

    setFilteredEvents(filtered);
  }, [searchTerm, selectedCategory, events]);

  if (loading) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading events...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-red-100">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Connection Error!
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm font-semibold mb-2">To fix this:</p>
              <p className="text-xs text-gray-600">1. Open terminal and run:</p>
              <code className="text-xs bg-gray-200 px-2 py-1 rounded block mb-2">
                cd C:\badhon\event-managements-server
              </code>
              <code className="text-xs bg-gray-200 px-2 py-1 rounded block">
                node index.js
              </code>
            </div>
            <button
              onClick={fetchEvents}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const eventsToShow = Array.isArray(filteredEvents) ? filteredEvents : [];

  return (
    <div className="pt-24 pb-16 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Discover Events
          </h1>
          <p className="text-lg text-gray-600">
            Find the perfect event for you
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div className="md:w-64">
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="text-gray-600 mb-6">
          Showing {eventsToShow.length} events
        </p>

        {eventsToShow.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-600">No events found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {eventsToShow.map(event => (
              <Link
                key={event._id}
                href={`/events/${event._id}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={
                      event.image ||
                      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'
                    }
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm font-bold text-purple-600">
                    ${event.price}
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <span className="px-3 py-1 bg-white/90 text-purple-600 text-xs rounded-full">
                      {event.category}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(event.date).toLocaleDateString()}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600">
                    {event.title}
                  </h3>
                  <p className="text-gray-600 line-clamp-2">
                    {event.shortDescription}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
