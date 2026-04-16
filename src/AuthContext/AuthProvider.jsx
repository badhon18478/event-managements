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

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    'https://event-managements-server-chi.vercel.app';

  const syncUserToBackend = async userData => {
    if (!userData?.email) return;
    try {
      await fetch(`${API_URL}/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: userData.uid,
          email: userData.email,
          displayName: userData.displayName,
          photoURL: userData.photoURL,
        }),
      });
    } catch (error) {
      console.error('Sync error:', error);
    }
  };

  const fetchUserRole = async email => {
    if (!email) return;
    try {
      const res = await fetch(`${API_URL}/api/users/role/${email}`);
      const data = await res.json();
      setUserRole(data.role || 'user');
    } catch (error) {
      setUserRole('user');
    }
  };

  // ✅ Google Sign In - সবসময় popup ব্যবহার করো (Vercel এর জন্য best)
  const signInGoogle = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log('Google sign in success:', result.user.email);

      await syncUserToBackend(result.user);
      await fetchUserRole(result.user.email);

      return result;
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (email, password, displayName) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      if (displayName) {
        await updateProfile(userCredential.user, { displayName });
      }
      await syncUserToBackend(userCredential.user);
      await fetchUserRole(email);
      return userCredential;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

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
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logOut = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUserRole('user');
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        userRole,
        registerUser,
        signInUser,
        signInGoogle,
        logOut,
        fetchUserRole,
        syncUserToBackend,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export default AuthProvider;
