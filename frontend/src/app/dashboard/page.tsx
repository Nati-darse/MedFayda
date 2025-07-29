'use client';

import {
  FaUser,
  FaCalendarAlt,
  FaFileAlt,
  FaBell,
  FaSignOutAlt,
  FaHeartbeat,
  FaUserMd,
} from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface User {
  id: string;
  faydaId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/auth/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/auth/login');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    alert('Logged Out: You have been successfully logged out.');
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto py-4 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FaHeartbeat className="w-8 h-8 text-cyan-500" />
              <h1 className="text-2xl font-bold text-blue-700">
                MedFayda
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {user.firstName[0]}{user.lastName[0]}
                </div>
                <div className="flex flex-col">
                  <div className="text-sm font-semibold">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="text-xs text-gray-500">
                    {user.role}
                  </div>
                </div>
              </div>
              <button
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
                onClick={handleLogout}
              >
                <FaSignOutAlt className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="flex flex-col space-y-8">
          {/* Welcome Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-col space-y-4">
              <h2 className="text-2xl font-bold">
                Welcome back, {user.firstName}!
              </h2>
              <p className="text-gray-600">
                Here&apos;s an overview of your health information and upcoming appointments.
              </p>
              <div className="flex space-x-4">
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                  Fayda ID: {user.faydaId}
                </span>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-md transition-shadow">
              <div className="flex flex-col items-center space-y-3 text-center">
                <FaUser className="w-8 h-8 text-blue-500" />
                <h3 className="font-semibold">My Profile</h3>
                <p className="text-sm text-gray-600">
                  View and update your personal information
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-md transition-shadow">
              <div className="flex flex-col items-center space-y-3 text-center">
                <FaFileAlt className="w-8 h-8 text-cyan-500" />
                <h3 className="font-semibold">Health Records</h3>
                <p className="text-sm text-gray-600">
                  Access your complete medical history
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-md transition-shadow">
              <div className="flex flex-col items-center space-y-3 text-center">
                <FaCalendarAlt className="w-8 h-8 text-green-500" />
                <h3 className="font-semibold">Appointments</h3>
                <p className="text-sm text-gray-600">
                  Schedule and manage appointments
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-md transition-shadow">
              <div className="flex flex-col items-center space-y-3 text-center">
                <FaBell className="w-8 h-8 text-orange-500" />
                <h3 className="font-semibold">Reminders</h3>
                <p className="text-sm text-gray-600">
                  Medication and checkup reminders
                </p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold">Recent Health Records</h3>
                </div>
                <div className="p-6">
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      No recent health records found.
                      <br />
                      Your medical visits will appear here.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold">Upcoming Appointments</h3>
                </div>
                <div className="p-6">
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      No upcoming appointments.
                      <br />
                      Schedule your next visit.
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
