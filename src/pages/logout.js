// pages/logout.js
'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

const Logout = () => {
  const router = useRouter();

  useEffect(() => {
    // Clear the token from cookies
    Cookies.remove('token');
    // Redirect to the login page
    router.push('/');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-500 to-indigo-600 text-white">
      <div className="bg-indigo-800 p-8 rounded-lg shadow-xl">
        <h1 className="text-3xl font-bold mb-4 text-center">Logging You Out...</h1>
        <p className="text-center">You will be redirected to the login page shortly. Please wait...</p>
      </div>
    </div>
  );
};

export default Logout;
