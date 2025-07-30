'use client';

import {
  FaUser,
  FaCalendarAlt,
  FaFileAlt,
  FaBell,
  FaSignOutAlt,
  FaHeartbeat,
  FaUserMd,
  FaChartLine,
  FaPills,
  FaHospital,
  FaShieldAlt
} from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/auth/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);

      // Note: Removed automatic redirects to allow users to choose their portal
      // Users can access different portals through navigation buttons

    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/auth/login');
      return;
    }

    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-500 mx-auto"></div>
          <div className="text-lg font-medium text-gray-600">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto py-4 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 rounded-full blur-lg opacity-30 animate-pulse"></div>
                <FaHeartbeat className="relative w-10 h-10 text-red-500" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  MedFayda
                </h1>
                <p className="text-sm text-gray-500">Health Management System</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-lg">
                  {user.firstName[0]}{user.lastName[0]}
                </div>
                <div className="hidden md:block">
                  <div className="text-sm font-semibold text-gray-800">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="text-xs text-gray-500 capitalize">
                    {user.role} • ID: {user.faydaId}
                  </div>
                </div>
              </div>
              <button
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                onClick={handleLogout}
              >
                <FaSignOutAlt className="w-4 h-4" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="flex flex-col space-y-8">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-2xl shadow-xl p-8 text-white">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="space-y-4 text-center md:text-left">
                <h2 className="text-3xl font-bold">
                  Welcome back, {user.firstName}! 👋
                </h2>
                <p className="text-blue-100 text-lg">
                  Access your complete medical history from all health centers across Ethiopia.
                </p>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 mt-4">
                  <p className="text-blue-100 text-sm">
                    🏥 <strong>Centralized Records:</strong> Your medical data is now accessible by authorized healthcare providers nationwide using your Fayda ID Number (FIN).
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
                    🆔 Fayda ID: {user.faydaId}
                  </span>
                  <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
                    👤 {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </div>
              </div>
              <div className="mt-6 md:mt-0">
                <div className="w-32 h-32 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <FaShieldAlt className="w-16 h-16 text-white/80" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Health Records</p>
                  <p className="text-2xl font-bold text-gray-900">12</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FaFileAlt className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Appointments</p>
                  <p className="text-2xl font-bold text-gray-900">3</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <FaCalendarAlt className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Medications</p>
                  <p className="text-2xl font-bold text-gray-900">5</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FaPills className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Reminders</p>
                  <p className="text-2xl font-bold text-gray-900">2</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <FaBell className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div
              onClick={() => router.push('/patient/profile')}
              className="group bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-100"
            >
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FaUser className="w-8 h-8 text-white" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-gray-800 text-lg">My Profile</h3>
                  <p className="text-sm text-gray-600">
                    View and update your personal information
                  </p>
                </div>
              </div>
            </div>

            <div
              onClick={() => router.push('/patient/records')}
              className="group bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-100"
            >
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FaFileAlt className="w-8 h-8 text-white" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-gray-800 text-lg">Health Records</h3>
                  <p className="text-sm text-gray-600">
                    Access your complete medical history
                  </p>
                </div>
              </div>
            </div>

            <div
              onClick={() => router.push('/patient/appointments')}
              className="group bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-100"
            >
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FaCalendarAlt className="w-8 h-8 text-white" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-gray-800 text-lg">Appointments</h3>
                  <p className="text-sm text-gray-600">
                    Schedule and manage appointments
                  </p>
                </div>
              </div>
            </div>

            <div
              onClick={() => router.push('/patient/medications')}
              className="group bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-100"
            >
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FaPills className="w-8 h-8 text-white" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-gray-800 text-lg">Medications</h3>
                  <p className="text-sm text-gray-600">
                    Track prescriptions and reminders
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-green-50 rounded-t-xl">
                  <div className="flex items-center space-x-3">
                    <FaChartLine className="w-6 h-6 text-blue-600" />
                    <h3 className="text-lg font-bold text-gray-800">Recent Health Records</h3>
                  </div>
                </div>
                <div className="p-8">
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaFileAlt className="w-10 h-10 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-lg font-medium">
                      No recent health records found
                    </p>
                    <p className="text-gray-400 text-sm mt-2">
                      Your medical visits will appear here
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50 rounded-t-xl">
                  <div className="flex items-center space-x-3">
                    <FaHospital className="w-6 h-6 text-green-600" />
                    <h3 className="text-lg font-bold text-gray-800">Upcoming Appointments</h3>
                  </div>
                </div>
                <div className="p-8">
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaCalendarAlt className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">
                      No upcoming appointments
                    </p>
                    <p className="text-gray-400 text-sm mt-2">
                      Schedule your next visit
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
