'use client';

import { FaShieldAlt, FaArrowLeft } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFaydaLogin = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Call backend to get authorization URL
      const response = await fetch('http://localhost:5000/api/auth/fayda-auth', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to initiate Fayda ID authentication');
      }

      const data = await response.json();

      // Redirect to Fayda ID authorization server
      window.location.href = data.authUrl;
    } catch (error) {
      console.error('Fayda login error:', error);
      setError('Failed to connect to Fayda ID. Please try again.');
      alert('Authentication Error: Failed to connect to Fayda ID. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto px-4">
        <div className="flex flex-col space-y-8">
          {/* Back Button */}
          <div className="flex justify-start">
            <button
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
              onClick={() => router.push('/')}
            >
              <FaArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </button>
          </div>

          {/* Login Card */}
          <div className="w-full bg-white rounded-lg shadow-lg p-8">
            <div className="flex flex-col space-y-6">
              {/* Header */}
              <div className="flex flex-col items-center space-y-3 text-center">
                <FaShieldAlt className="w-12 h-12 text-blue-500" />
                <h1 className="text-2xl font-bold text-blue-700">
                  Login to MedFayda
                </h1>
                <p className="text-gray-600">
                  Secure access with your Fayda ID
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex">
                    <div className="text-red-800 text-sm">
                      {error}
                    </div>
                  </div>
                </div>
              )}

              {/* Login Button */}
              <div className="flex flex-col space-y-4 w-full">
                <button
                  className="w-full py-3 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                  onClick={handleFaydaLogin}
                  disabled={isLoading}
                >
                  {!isLoading && <FaShieldAlt className="w-4 h-4" />}
                  <span>{isLoading ? 'Connecting to Fayda ID...' : 'Login with Fayda ID'}</span>
                </button>

                <p className="text-sm text-gray-500 text-center">
                  You will be redirected to the official Fayda ID login page
                </p>
              </div>

              {/* Alternative Login */}
              <div className="flex flex-col space-y-3 w-full pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 text-center">
                  Having trouble with Fayda ID?
                </p>
                <button
                  className="py-2 px-4 border-2 border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition-colors"
                  onClick={() => router.push('/auth/sms-login')}
                >
                  Use SMS Login Instead
                </button>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="w-full bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex flex-col space-y-2 text-center">
              <p className="text-sm font-semibold text-blue-800">
                🔒 Secure Authentication
              </p>
              <p className="text-xs text-blue-700">
                Your login is protected by government-grade security through Fayda ID.
                We never store your Fayda ID credentials.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
