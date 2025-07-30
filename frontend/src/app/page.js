'use client';

import { FaHeartbeat, FaUserMd, FaCalendarAlt, FaShieldAlt, FaStar, FaUsers, FaLock } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Home() {
  const router = useRouter();
  const [loginError, setLoginError] = useState('');

const handleFaydaLogin = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/auth/fayda/login', {
      method: 'GET', // Change to GET
      credentials: 'include', // Include credentials for session support
    });

    if (!response.ok) {
      throw new Error('Failed to initiate Fayda ID authentication');
    }

    const data = await response.json();
    console.log('Fayda login response:', data);
    // Handle successful response (e.g., redirect to data.authUrl)
    window.location.href = data.authUrl; // Redirect to Fayda authentication URL
  } catch (error) {
    console.error('Fayda login error:', error);
    setLoginError(error.message); // Set error message to display
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-green-600/10"></div>
        <div className="absolute inset-0 opacity-40">
          <div className="w-full h-full bg-gradient-to-br from-blue-50/50 to-green-50/50 bg-[radial-gradient(circle_at_1px_1px,rgba(156,146,172,0.05)_1px,transparent_0)] bg-[length:60px_60px]"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-20">
          <div className="text-center space-y-8">
            {/* Logo and Title */}
            <div className="flex items-center justify-center space-x-4 mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-green-500 rounded-full blur-lg opacity-30 animate-pulse"></div>
                <FaHeartbeat className="relative w-16 h-16 text-red-500 animate-pulse" />
              </div>
              <div>
                <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  MedFayda
                </h1>
                <div className="flex items-center justify-center space-x-1 mt-2">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className="w-4 h-4 text-yellow-400" />
                  ))}
                  <span className="ml-2 text-sm text-gray-600">Trusted by thousands</span>
                </div>
              </div>
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 leading-tight">
                Your Health Records,
                <span className="block text-blue-600">Secured by Fayda ID</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Access your complete medical history instantly. Connect with healthcare providers 
                across Ethiopia through our government-integrated platform.
              </p>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 py-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">10K+</div>
                <div className="text-sm text-gray-600">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">500+</div>
                <div className="text-sm text-gray-600">Healthcare Providers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">99.9%</div>
                <div className="text-sm text-gray-600">Uptime</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center space-x-2"
                onClick={handleFaydaLogin}
              >
                <FaShieldAlt className="w-5 h-5" />
                <span>Login with Fayda ID</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-800 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
              <button
                className="px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-all duration-300 flex items-center space-x-2"
                onClick={() => router.push('/auth/sms-login')}
              >
                <span>SMS Login</span>
              </button>
            </div>

            {/* Display Login Error */}
            {loginError && <div className="text-red-500">{loginError}</div>}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-800 mb-4">
              Why Choose MedFayda?
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the future of healthcare management with our comprehensive platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group relative bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="absolute top-4 right-4 w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                <FaShieldAlt className="w-6 h-6 text-blue-500" />
              </div>
              <div className="space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                  <FaLock className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-bold text-gray-800">Government-Grade Security</h4>
                <p className="text-gray-600 leading-relaxed">
                  Your medical data is protected by Ethiopia's official Fayda ID system, 
                  ensuring maximum security and privacy compliance.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="absolute top-4 right-4 w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                <FaUserMd className="w-6 h-6 text-green-500" />
              </div>
              <div className="space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
                  <FaUserMd className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-bold text-gray-800">Unified Health Records</h4>
                <p className="text-gray-600 leading-relaxed">
                  Access your complete medical history from all healthcare providers 
                  in one secure, centralized location.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="absolute top-4 right-4 w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center">
                <FaCalendarAlt className="w-6 h-6 text-purple-500" />
              </div>
              <div className="space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <FaCalendarAlt className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-bold text-gray-800">Smart Health Management</h4>
                <p className="text-gray-600 leading-relaxed">
                  Never miss appointments or medications with intelligent reminders 
                  and automated health tracking.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Section */}
      <div className="py-20 bg-gradient-to-r from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="space-y-8">
            <div className="flex items-center justify-center space-x-2">
              <FaUsers className="w-8 h-8 text-blue-600" />
              <h3 className="text-2xl font-bold text-gray-800">
                Trusted by Healthcare Professionals
              </h3>
            </div>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Built in partnership with Ethiopia's Ministry of Health and leading healthcare 
              institutions to ensure the highest standards of care and data protection.
            </p>
            <div className="bg-white rounded-2xl p-8 shadow-lg max-w-2xl mx-auto">
              <div className="flex items-center justify-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <FaShieldAlt className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-800">ISO 27001 Certified</div>
                  <div className="text-sm text-gray-600">International security standards</div>
                </div>
              </div>
              <p className="text-gray-600 text-sm">
                Your health data is encrypted and stored according to international 
                healthcare data protection standards.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <FaHeartbeat className="w-8 h-8 text-red-500" />
            <span className="text-2xl font-bold">MedFayda</span>
          </div>
          <p className="text-gray-400 mb-4">
            Empowering Ethiopia's healthcare system with secure, accessible medical records
          </p>
          <div className="text-sm text-gray-500">
            © 2024 MedFayda. Built with ❤️ for Ethiopia's healthcare future.
          </div>
        </div>
      </footer>
    </div>
  );
}