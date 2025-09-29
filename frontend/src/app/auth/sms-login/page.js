'use client';

import { FaSms, FaArrowLeft, FaPhone, FaSpinner, FaCheckCircle } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SMSLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState('phone');
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
      const response = await fetch('http://localhost:5000/api/auth/sms/send-otp', {
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
      
      // Show success message
      if (data.otp) {
        alert(`Development Mode - Your OTP is: ${data.otp}`);
      }
    } catch (error) {
      console.error('SMS login error:', error);
      setError(error.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/sms/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ sessionId, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid OTP');
      }

      // Store token and redirect to dashboard
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      router.push('/dashboard');
    } catch (error) {
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
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50 py-12">
      <div className="max-w-md mx-auto px-4">
        <div className="flex flex-col space-y-8">
          {/* Back Button */}
          <div className="flex justify-start">
            <button
              className="flex items-center space-x-2 text-gray-600 hover:text-cyan-600 transition-colors duration-200 group"
              onClick={() => step === 'otp' ? setStep('phone') : router.push('/')}
            >
              <FaArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
              <span className="font-medium">{step === 'otp' ? 'Back to Phone' : 'Back to Home'}</span>
            </button>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="flex flex-col space-y-8">
              {/* Header */}
              <div className="text-center space-y-4">
                <div className="relative mx-auto w-20 h-20">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full blur-lg opacity-30 animate-pulse"></div>
                  <div className="relative w-20 h-20 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                    <FaSms className="w-10 h-10 text-white" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                    SMS Login
                  </h1>
                  <p className="text-gray-600 text-lg">
                    {step === 'phone' 
                      ? 'Enter your phone number to receive a verification code'
                      : 'Enter the 6-digit code sent to your phone'
                    }
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
                      <p className="text-red-800 font-medium">Error</p>
                      <p className="text-red-700 text-sm mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Phone Number Step */}
              {step === 'phone' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FaPhone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        placeholder="+251 9XX XXX XXX"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="block w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-200"
                      />
                    </div>
                  </div>

                  <button
                    className="w-full py-4 px-6 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    onClick={handleSendOTP}
                    disabled={isLoading}
                  >
                    <div className="flex items-center justify-center space-x-3">
                      {isLoading ? (
                        <>
                          <FaSpinner className="w-5 h-5 animate-spin" />
                          <span>Sending Code...</span>
                        </>
                      ) : (
                        <>
                          <FaSms className="w-5 h-5" />
                          <span>Send Verification Code</span>
                        </>
                      )}
                    </div>
                  </button>
                </div>
              )}

              {/* OTP Verification Step */}
              {step === 'otp' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3 text-center">
                      Verification Code sent to <span className="text-cyan-600">{phoneNumber}</span>
                    </label>
                    <div className="flex justify-center">
                      <input
                        type="text"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        placeholder="123456"
                        className="w-48 px-4 py-4 text-center text-2xl font-mono border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-200 tracking-widest"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      className="w-full py-4 px-6 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      onClick={handleVerifyOTP}
                      disabled={isLoading || otp.length !== 6}
                    >
                      <div className="flex items-center justify-center space-x-3">
                        {isLoading ? (
                          <>
                            <FaSpinner className="w-5 h-5 animate-spin" />
                            <span>Verifying...</span>
                          </>
                        ) : (
                          <>
                            <FaCheckCircle className="w-5 h-5" />
                            <span>Verify & Login</span>
                          </>
                        )}
                      </div>
                    </button>

                    <button
                      className="w-full py-3 px-4 text-cyan-600 hover:text-cyan-700 font-medium transition-colors duration-200 disabled:opacity-50"
                      onClick={handleResendOTP}
                      disabled={isLoading}
                    >
                      {"Didn't receive the code? Resend"}
                    </button>
                  </div>
                </div>
              )}

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
                className="w-full py-3 px-4 border-2 border-blue-200 text-blue-600 rounded-xl font-medium hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
                onClick={() => router.push('/auth/login')}
              >
                Login with Fayda ID
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
