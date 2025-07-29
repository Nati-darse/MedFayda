'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        if (error) {
          throw new Error(`Authentication failed: ${error}`);
        }

        if (!code || !state) {
          throw new Error('Missing authorization code or state parameter');
        }

        // Send the authorization code to the backend
        const response = await fetch('http://localhost:5000/api/auth/fayda-callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ code, state }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Authentication failed');
        }

        // Store token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        setStatus('success');

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);

      } catch (error: any) {
        console.error('Authentication callback error:', error);
        setError(error.message || 'Authentication failed');
        setStatus('error');
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto px-4">
        <div className="flex flex-col items-center space-y-6 text-center">
          {status === 'loading' && (
            <>
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
              <h1 className="text-2xl font-bold text-blue-700">
                Completing Authentication
              </h1>
              <p className="text-gray-600">
                Please wait while we verify your Fayda ID credentials...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="text-6xl">✅</div>
              <h1 className="text-2xl font-bold text-green-600">
                Authentication Successful!
              </h1>
              <p className="text-gray-600">
                Welcome to MedFayda! You will be redirected to your dashboard shortly.
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="bg-red-50 border border-red-200 rounded-md p-4 w-full">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="text-red-400">⚠️</div>
                  </div>
                  <div className="ml-3">
                    <div className="text-sm">
                      <p className="font-semibold text-red-800">Authentication Failed</p>
                      <p className="text-red-700 mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col space-y-3">
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  onClick={() => router.push('/auth/login')}
                >
                  Try Again
                </button>
                <button
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  onClick={() => router.push('/')}
                >
                  Back to Home
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
