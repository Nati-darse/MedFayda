'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { FaSpinner, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');

        console.log('Callback received:', { code, state });

        if (!code || !state) {
          throw new Error('Missing authorization code or state parameter');
        }

        // Send callback data to backend
        const response = await fetch('http://localhost:5000/api/auth/fayda/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ code, state }),
        });

        const data = await response.json();
        console.log('Backend response:', data);

        if (!response.ok) {
          throw new Error(data.message || `Authentication failed (${response.status})`);
        }

        // Store token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        setStatus('success');

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);

      } catch (error) {
        console.error('Callback error:', error);
        setError(error.message || 'Authentication failed');
        setStatus('error');
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
      <div className="max-w-md mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="flex flex-col items-center space-y-6 text-center">
            {status === 'loading' && (
              <>
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-spin border-t-blue-500"></div>
                  <FaSpinner className="absolute inset-0 m-auto w-8 h-8 text-blue-500 animate-pulse" />
                </div>
                <div className="space-y-2">
                  <h1 className="text-2xl font-bold text-blue-700">
                    Completing Authentication
                  </h1>
                  <p className="text-gray-600">
                    Please wait while we verify your Fayda ID credentials...
                  </p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full animate-pulse" style={{width: '70%'}}></div>
                </div>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center animate-bounce">
                    <FaCheckCircle className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-ping"></div>
                </div>
                <div className="space-y-2">
                  <h1 className="text-2xl font-bold text-green-600">
                    Authentication Successful! 🎉
                  </h1>
                  <p className="text-gray-600">
                    Welcome to MedFayda! You will be redirected to your dashboard shortly.
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-sm text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Redirecting to dashboard...</span>
                </div>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="w-20 h-20 bg-gradient-to-r from-red-400 to-red-500 rounded-full flex items-center justify-center">
                  <FaExclamationTriangle className="w-10 h-10 text-white" />
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-red-600">
                      Authentication Failed
                    </h1>
                    <p className="text-gray-600">
                      We encountered an issue while verifying your credentials.
                    </p>
                  </div>
                  <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 text-left">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <FaExclamationTriangle className="w-5 h-5 text-red-500" />
                      </div>
                      <div className="ml-3">
                        <p className="text-red-800 font-medium">Error Details</p>
                        <p className="text-red-700 text-sm mt-1">{error}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-3">
                    <button
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
                      onClick={() => router.push('/auth/login')}
                    >
                      Try Again
                    </button>
                    <button
                      className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                      onClick={() => router.push('/')}
                    >
                      Back to Home
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-spin border-t-blue-500"></div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
