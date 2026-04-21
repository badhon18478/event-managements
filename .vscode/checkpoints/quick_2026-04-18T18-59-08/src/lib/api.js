import axios from 'axios';
import { auth } from './firebase.init';

// Vercel ডিপ্লয় করা ব্যাকএন্ড URL
const BASE_URL = 'https://event-managements-server-chi.vercel.app/api';

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  async config => {
    try {
      const user = auth?.currentUser;
      if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
        console.log('✅ Token added for:', config.url);
      } else {
        console.log('⚠️ No user logged in');
      }
    } catch (error) {
      console.error('❌ Error getting auth token:', error);
    }
    return config;
  },
  error => Promise.reject(error),
);

// Response interceptor
api.interceptors.response.use(
  response => {
    console.log('✅ Response:', response.config.url);
    return response.data;
  },
  error => {
    console.error(
      '❌ API Error:',
      error.response?.status,
      error.response?.data,
    );
    return Promise.reject(error);
  },
);

// ================================
// Event API Methods
// ================================

/**
 * Get all events
 */
export const getAllEvents = async (params = {}) => {
  try {
    console.log('📡 Fetching all events');
    const response = await api.get('/events', { params });
    console.log(
      '✅ Events response:',
      response?.data?.length || response?.length || 0,
      'events',
    );
    return response;
  } catch (error) {
    console.error('❌ getAllEvents error:', error.message);
    return { data: [] };
  }
};

/**
 * Get latest events
 */
export const getLatestEvents = async (limit = 6) => {
  try {
    console.log('📡 Fetching latest events');
    const response = await api.get('/events/latest', { params: { limit } });
    return response;
  } catch (error) {
    console.error('❌ getLatestEvents error:', error.message);
    return [];
  }
};

/**
 * Get single event by ID
 */
export const getEventById = async id => {
  try {
    if (!id) throw new Error('Event ID is required');
    console.log('📡 Fetching event by ID:', id);
    const response = await api.get(`/events/${id}`);
    return response;
  } catch (error) {
    console.error('❌ getEventById error:', error.message);
    throw error;
  }
};

/**
 * Get events by user ID
 */
export const getEventsByUser = async (userId, params = {}) => {
  try {
    if (!userId) {
      console.error('❌ No userId provided');
      return { data: [] };
    }
    console.log('📡 Fetching events for user:', userId);
    const response = await api.get(`/events/user/${userId}`, { params });
    console.log(
      '✅ Events response:',
      response?.data?.length || response?.length || 0,
      'events',
    );
    return response;
  } catch (error) {
    console.error('❌ getEventsByUser error:', error.message);
    return { data: [] };
  }
};

/**
 * Create new event
 */
export const createEvent = async eventData => {
  try {
    if (!eventData) throw new Error('Event data is required');
    console.log('📡 Creating event');
    const response = await api.post('/events', eventData);
    console.log('✅ Event created:', response?._id);
    return response;
  } catch (error) {
    console.error('❌ createEvent error:', error.message);
    throw error;
  }
};

/**
 * Update event
 */
export const updateEvent = async (id, eventData) => {
  try {
    if (!id) throw new Error('Event ID is required');
    if (!eventData) throw new Error('Event data is required');
    console.log('📡 Updating event:', id);
    return await api.put(`/events/${id}`, eventData);
  } catch (error) {
    console.error('❌ updateEvent error:', error.message);
    throw error;
  }
};

/**
 * Delete event
 */
export const deleteEvent = async id => {
  try {
    if (!id) throw new Error('Event ID is required');
    console.log('📡 Deleting event:', id);
    return await api.delete(`/events/${id}`);
  } catch (error) {
    console.error('❌ deleteEvent error:', error.message);
    throw error;
  }
};

// ================================
// Payment API Methods
// ================================

/**
 * Create payment intent
 * @param {Object} data - { eventId, amount }
 */
export const createPaymentIntent = async data => {
  try {
    if (!data.eventId || !data.amount) {
      throw new Error('Event ID and amount are required');
    }
    console.log('💰 Creating payment intent for:', data);
    const response = await api.post('/create-payment-intent', data);
    console.log('✅ Payment intent created');
    return response;
  } catch (error) {
    console.error('❌ createPaymentIntent error:', error.message);
    throw error;
  }
};

/**
 * Save payment record
 * @param {Object} paymentData - Payment details
 */
export const savePayment = async paymentData => {
  try {
    const { paymentIntentId, eventId, eventTitle, amount, status } =
      paymentData;
    if (!paymentIntentId || !eventId || !amount) {
      throw new Error('Missing required payment fields');
    }
    console.log('💾 Saving payment record');
    const response = await api.post('/payments', paymentData);
    console.log('✅ Payment saved');
    return response;
  } catch (error) {
    console.error('❌ savePayment error:', error.message);
    throw error;
  }
};

/**
 * Get user payments
 */
export const getUserPayments = async () => {
  try {
    console.log('📡 Fetching payments');
    const response = await api.get('/payments');
    console.log(
      '✅ Payments response:',
      response?.data?.length || response?.length || 0,
      'payments',
    );
    return response;
  } catch (error) {
    console.error('❌ getUserPayments error:', error.message);
    return { data: [] };
  }
};

/**
 * Get single payment by ID
 */
export const getPaymentById = async id => {
  try {
    if (!id) throw new Error('Payment ID is required');
    console.log('📡 Fetching payment:', id);
    return await api.get(`/payments/${id}`);
  } catch (error) {
    console.error('❌ getPaymentById error:', error.message);
    throw error;
  }
};

// ================================
// Dashboard API Methods
// ================================

/**
 * Get dashboard stats
 */
export const getDashboardStats = async () => {
  try {
    const user = auth?.currentUser;
    if (!user)
      return {
        totalEvents: 0,
        totalPayments: 0,
        totalRevenue: 0,
        upcomingEvents: 0,
      };

    const [eventsRes, paymentsRes] = await Promise.all([
      getEventsByUser(user.uid),
      getUserPayments(),
    ]);

    const events = eventsRes?.data || eventsRes || [];
    const payments = paymentsRes?.data || paymentsRes || [];

    return {
      totalEvents: events.length,
      totalPayments: payments.length,
      totalRevenue: payments.reduce((sum, p) => sum + (p.amount || 0), 0),
      upcomingEvents: events.filter(e => new Date(e.date) > new Date()).length,
    };
  } catch (error) {
    console.error('❌ getDashboardStats error:', error);
    return {
      totalEvents: 0,
      totalPayments: 0,
      totalRevenue: 0,
      upcomingEvents: 0,
    };
  }
};

// ================================
// Health Check Methods
// ================================

/**
 * Check API health
 */
export const checkHealth = async () => {
  try {
    const healthURL = BASE_URL.replace('/api', '') + '/health';
    console.log('📡 Checking health at:', healthURL);
    const response = await axios.get(healthURL);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Check backend status
 */
export const checkBackendStatus = async () => {
  try {
    const baseURL = BASE_URL.replace('/api', '');
    const response = await axios.get(baseURL);
    console.log('✅ Backend is running:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Backend is not running:', error.message);
    return { success: false, error: error.message };
  }
};

export default api;
