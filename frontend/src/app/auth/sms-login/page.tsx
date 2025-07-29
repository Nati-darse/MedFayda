'use client';

import { FaSms, FaArrowLeft, FaPhone } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SMSLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOTP = async () => {
    if (!phoneNumber.trim()) {
      setError('Please enter your phone number');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/sms-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP');
      }

      setStep('otp');
      setSessionId(data.sessionId || '');
      alert(`OTP Sent: Verification code sent to ${phoneNumber}`);

      // In development, show the OTP
      if (data.otp) {
        alert(`Development Mode - Your OTP is: ${data.otp}`);
      }
    } catch (error: any) {
      console.error('SMS login error:', error);
      setError(error.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ phoneNumber, otp, sessionId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid OTP');
      }

      // Store token and redirect to dashboard
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      alert('Login Successful: Welcome to MedFayda!');
      router.push('/dashboard');
    } catch (error: any) {
      console.error('OTP verification error:', error);
      setError(error.message || 'Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = () => {
    setOtp('');
    setError('');
    handleSendOTP();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto px-4">
        <div className="flex flex-col space-y-8">
          {/* Back Button */}
          <div className="flex justify-start">
            <button
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
              onClick={() => step === 'otp' ? setStep('phone') : router.push('/')}
            >
              <FaArrowLeft className="w-4 h-4" />
              <span>{step === 'otp' ? 'Back to Phone' : 'Back to Home'}</span>
            </button>
          </div>

          {/* Login Card */}
          <div className="w-full bg-white rounded-lg shadow-lg p-8">
            <div className="flex flex-col space-y-6">
              {/* Header */}
              <div className="flex flex-col items-center space-y-3 text-center">
                <FaSms className="w-12 h-12 text-cyan-500" />
                <h1 className="text-2xl font-bold text-blue-700">
                  SMS Login
                </h1>
                <p className="text-gray-600">
                  {step === 'phone'
                    ? 'Enter your phone number to receive a verification code'
                    : 'Enter the 6-digit code sent to your phone'
                  }
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

              {/* Phone Number Step */}
              {step === 'phone' && (
                <div className="flex flex-col space-y-4 w-full">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaPhone className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        placeholder="+251 9XX XXX XXX"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-cyan-500 focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <button
                    className="w-full py-3 px-4 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors disabled:opacity-50"
                    onClick={handleSendOTP}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Sending OTP...' : 'Send Verification Code'}
                  </button>
                </div>
              )}

              {/* OTP Verification Step */}
              {step === 'otp' && (
                <div className="flex flex-col space-y-4 w-full">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                      Verification Code sent to {phoneNumber}
                    </label>
                    <div className="flex justify-center space-x-2">
                      <input
                        type="text"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="123456"
                        className="w-32 px-3 py-3 text-center text-lg border border-gray-300 rounded-lg focus:ring-cyan-500 focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 w-full">
                    <button
                      className="w-full py-3 px-4 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors disabled:opacity-50"
                      onClick={handleVerifyOTP}
                      disabled={isLoading || otp.length !== 6}
                    >
                      {isLoading ? 'Verifying...' : 'Verify & Login'}
                    </button>

                    <button
                      className="py-2 px-4 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
                      onClick={handleResendOTP}
                      disabled={isLoading}
                    >
                      Resend Code
                    </button>
                  </div>
                </div>
              )}

              {/* Alternative Login */}
              <div className="flex flex-col space-y-3 w-full pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 text-center">
                  Have a Fayda ID?
                </p>
                <button
                  className="py-2 px-4 border-2 border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition-colors"
                  onClick={() => router.push('/auth/login')}
                >
                  Login with Fayda ID
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
