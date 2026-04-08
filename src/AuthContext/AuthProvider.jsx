'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth } from '@/lib/firebase.init';

export const AuthContext = createContext(null);

const googleProvider = new GoogleAuthProvider();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('user');

  // Get API URL from environment
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // =========================
  // Save user to MongoDB Backend
  // =========================
  const syncUserToBackend = async userData => {
    if (!userData) return;

    try {
      console.log('📡 Syncing user to backend:', userData.email);

      const response = await fetch(`${API_URL}/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: userData.uid,
          email: userData.email,
          displayName: userData.displayName,
          photoURL: userData.photoURL,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('Response not OK:', text);
        return;
      }

      const data = await response.json();
      console.log('✅ User synced to MongoDB:', data);
      return data;
    } catch (error) {
      console.error('❌ Error syncing user:', error.message);
    }
  };

  // =========================
  // Get user role from MongoDB
  // =========================
  const fetchUserRole = async email => {
    if (!email) return;
    try {
      const response = await fetch(`${API_URL}/api/users/role/${email}`);
      const data = await response.json();
      setUserRole(data.role || 'user');
      return data;
    } catch (error) {
      console.error('Error fetching role:', error);
      setUserRole('user');
    }
  };

  // =========================
  // Register with Email/Password
  // =========================
  const registerUser = async (email, password, displayName) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      // Update profile with display name
      if (displayName) {
        await updateProfile(userCredential.user, { displayName });
      }

      // Save to backend
      await syncUserToBackend(userCredential.user);
      await fetchUserRole(email);

      return userCredential;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // Sign In with Email/Password
  // =========================
  const signInUser = async (email, password) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      await syncUserToBackend(userCredential.user);
      await fetchUserRole(email);
      return userCredential;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // Sign In with Google
  // =========================
  const signInGoogle = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await syncUserToBackend(result.user);
      await fetchUserRole(result.user.email);
      return result;
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // Log Out
  // =========================
  const logOut = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUserRole('user');
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // Update User Profile
  // =========================
  const updateUserProfile = async profile => {
    try {
      await updateProfile(auth.currentUser, profile);
      await syncUserToBackend(auth.currentUser);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  // =========================
  // Update User Role (Admin only - will be used by admin panel)
  // =========================
  const updateUserRole = async (email, newRole) => {
    try {
      const token = await user?.getIdToken();
      const response = await fetch(`${API_URL}/api/users/${email}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': application / json,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await response.json();
      if (data.success && user?.email === email) {
        setUserRole(newRole);
      }
      return data;
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  // =========================
  // Auth State Listener
  // =========================
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async currentUser => {
      setUser(currentUser);

      if (currentUser) {
        await syncUserToBackend(currentUser);
        await fetchUserRole(currentUser.email);
      }

      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const authInfo = {
    user,
    loading,
    userRole,
    registerUser,
    signInUser,
    signInGoogle,
    logOut,
    updateUserProfile,
    updateUserRole,
    fetchUserRole,
    syncUserToBackend,
  };

  return (
    <AuthContext.Provider value={authInfo}>{children}</AuthContext.Provider>
  );
};

// =========================
// Custom hook with error checking
// =========================
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider;
