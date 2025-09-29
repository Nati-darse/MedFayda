'use client';

import { FaShieldAlt, FaArrowLeft, FaSpinner, FaCheckCircle } from 'react-icons/fa';
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
      const response = await fetch('http://localhost:5000/api/auth/fayda/login', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to initiate Fayda ID authentication');
      }

      const data = await response.json();
      console.log('Auth URL received:', data);

      // Store state in localStorage as backup
      if (data.state) {
        localStorage.setItem('auth_state', data.state);
      }

      // Redirect to Fayda ID authorization server
      window.location.href = data.authUrl;
    } catch (error) {
      console.error('Fayda login error:', error);
      setError('Failed to connect to Fayda ID. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-12">
      <div className="max-w-md mx-auto px-4">
        <div className="flex flex-col space-y-8">
          {/* Back Button */}
          <div className="flex justify-start">
            <button
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors duration-200 group"
              onClick={() => router.push('/')}
            >
              <FaArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
              <span className="font-medium">Back to Home</span>
            </button>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="flex flex-col space-y-8">
              {/* Header */}
              <div className="text-center space-y-4">
                <div className="relative mx-auto w-20 h-20">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-green-500 rounded-full blur-lg opacity-30 animate-pulse"></div>
                  <div className="relative w-20 h-20 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                    <FaShieldAlt className="w-10 h-10 text-white" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                    Welcome Back
                  </h1>
                  <p className="text-gray-600 text-lg">
                    Sign in with your Fayda ID
                  </p>
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-5 h-5 text-red-500">⚠️</div>
                    </div>
                    <div className="ml-3">
                      <p className="text-red-800 font-medium">Authentication Error</p>
                      <p className="text-red-700 text-sm mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Login Button */}
              <div className="space-y-6">
                <button
                  className="group relative w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  onClick={handleFaydaLogin}
                  disabled={isLoading}
                >
                  <div className="flex items-center justify-center space-x-3">
                    {isLoading ? (
                      <>
                        <FaSpinner className="w-5 h-5 animate-spin" />
                        <span>Connecting to Fayda ID...</span>
                      </>
                    ) : (
                      <>
                        <FaShieldAlt className="w-5 h-5" />
                        <span>Login with Fayda ID</span>
                      </>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-800 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>

                <p className="text-sm text-gray-500 text-center leading-relaxed">
                  🔒 You will be securely redirected to the official Fayda ID login page
                </p>
              </div>

              {/* Alternative Login */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500 font-medium">Or continue with</span>
                </div>
              </div>

              <button
                className="w-full py-3 px-4 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
                onClick={() => router.push('/auth/sms-login')}
              >
                SMS Verification
              </button>
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-start space-x-3">
              <FaCheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-800">
                  🛡️ Government-Grade Security
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {"Your login is protected by Ethiopia's official Fayda ID system. We never store your credentials and all data is encrypted end-to-end."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
