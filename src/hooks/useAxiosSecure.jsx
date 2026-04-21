'use client';

import { useContext, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
// import { AuthContext } from '@/AuthContext/AuthProvider';
import { AuthContext } from '../AuthContext/AuthProvider';
import { toast } from 'react-hot-toast';

const useAxiosSecure = () => {
  const router = useRouter();
  const { user, logOut } = useContext(AuthContext); // removed refreshToken
  const instance = useMemo(
    () =>
      axios.create({
        baseURL:
          process.env.NEXT_PUBLIC_API_URL ||
          'https://event-managements-server-chi.vercel.app',
      }),
    [],
  );

  useEffect(() => {
    if (!user) return; // Do nothing until user exists

    const requestInterceptor = instance.interceptors.request.use(
      config => {
        if (user?.accessToken) {
          config.headers.Authorization = `Bearer ${user.accessToken}`;
        }
        return config;
      },
      error => Promise.reject(error),
    );

    const responseInterceptor = instance.interceptors.response.use(
      response => response,
      async error => {
        const status = error.response?.status;

        if (status === 401 || status === 403) {
          toast.error('Session expired. Please login again.');
          await logOut();
          router.push('/login');
        }

        return Promise.reject(error);
      },
    );

    return () => {
      instance.interceptors.request.eject(requestInterceptor);
      instance.interceptors.response.eject(responseInterceptor);
    };
  }, [user, logOut, router, instance]);

  return instance;
};

export default useAxiosSecure;
