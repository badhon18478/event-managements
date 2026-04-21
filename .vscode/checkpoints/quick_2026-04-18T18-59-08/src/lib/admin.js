import axios from 'axios';
import { auth } from './firebase.init';

// Base URL
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Create axios instance
const adminApi = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// Request interceptor - Add auth token
adminApi.interceptors.request.use(
  async config => {
    const user = auth?.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error),
);

// ================================
// Admin Dashboard Stats
// ================================
export const getAdminStats = async () => {
  try {
    const response = await adminApi.get('/admin/api/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    throw error;
  }
};

// ================================
// User Management
// ================================
export const getAdminUsers = async (params = {}) => {
  try {
    const response = await adminApi.get('/admin/api/users', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const deleteAdminUser = async userId => {
  try {
    const response = await adminApi.delete(`/admin/api/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

// ================================
// Event Management
// ================================
export const getAdminEvents = async (params = {}) => {
  try {
    const response = await adminApi.get('/admin/api/events', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching admin events:', error);
    throw error;
  }
};

export const deleteAdminEvent = async eventId => {
  try {
    const response = await adminApi.delete(`/admin/api/events/${eventId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};

// ================================
// Payment Management
// ================================
export const getAdminPayments = async (params = {}) => {
  try {
    const response = await adminApi.get('/admin/api/payments', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching admin payments:', error);
    throw error;
  }
};

// ================================
// Analytics
// ================================
export const getAdminAnalytics = async (period = 'monthly') => {
  try {
    const response = await adminApi.get('/admin/api/analytics', {
      params: { period },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching analytics:', error);
    throw error;
  }
};

// ================================
// Admin Settings
// ================================
export const updateAdminSettings = async settings => {
  try {
    const response = await adminApi.put('/admin/api/settings', settings);
    return response.data;
  } catch (error) {
    console.error('Error updating settings:', error);
    throw error;
  }
};

export const getAdminSettings = async () => {
  try {
    const response = await adminApi.get('/admin/api/settings');
    return response.data;
  } catch (error) {
    console.error('Error fetching settings:', error);
    throw error;
  }
};

export default adminApi;
