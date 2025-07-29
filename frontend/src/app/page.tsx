'use client';

import { FaHeartbeat, FaUserMd, FaCalendarAlt, FaShieldAlt } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-20 px-4">
        <div className="flex flex-col items-center space-y-12 text-center">
          {/* Hero Section */}
          <div className="flex flex-col items-center space-y-6">
            <div className="flex items-center space-x-3">
              <FaHeartbeat className="w-12 h-12 text-blue-500" />
              <h1 className="text-4xl font-bold text-blue-700">
                MedFayda
              </h1>
            </div>
            <h2 className="text-2xl text-gray-600 max-w-2xl">
              Secure Health Record Access System for Ethiopia
            </h2>
            <p className="text-xl text-gray-500 max-w-3xl">
              Unified health records linked to Fayda IDs with real-time access for doctors
              and secure, nationwide scalability.
            </p>
          </div>

          {/* Features */}
          <div className="flex flex-wrap justify-center gap-8">
            <div className="flex flex-col items-center space-y-3 p-6 bg-white rounded-lg shadow-md min-w-[200px]">
              <FaShieldAlt className="w-8 h-8 text-blue-500" />
              <h3 className="font-bold">Fayda ID Integration</h3>
              <p className="text-sm text-gray-600 text-center">
                Government-backed identity verification
              </p>
            </div>
            <div className="flex flex-col items-center space-y-3 p-6 bg-white rounded-lg shadow-md min-w-[200px]">
              <FaUserMd className="w-8 h-8 text-cyan-500" />
              <h3 className="font-bold">Unified Records</h3>
              <p className="text-sm text-gray-600 text-center">
                Complete medical history in one place
              </p>
            </div>
            <div className="flex flex-col items-center space-y-3 p-6 bg-white rounded-lg shadow-md min-w-[200px]">
              <FaCalendarAlt className="w-8 h-8 text-green-500" />
              <h3 className="font-bold">Smart Reminders</h3>
              <p className="text-sm text-gray-600 text-center">
                Never miss appointments or medications
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            <button
              className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              onClick={() => router.push('/auth/login')}
            >
              Login with Fayda ID
            </button>
            <button
              className="px-8 py-3 border-2 border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition-colors"
              onClick={() => router.push('/auth/sms-login')}
            >
              SMS Login
            </button>
          </div>

          {/* Footer */}
          <p className="text-sm text-gray-500 mt-12">
            Built for Ethiopia&apos;s healthcare system with security and accessibility in mind
          </p>
        </div>
      </div>
    </div>
  );
}
