'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaUserMd,
  FaSearch,
  FaUsers,
  FaFileAlt,
  FaCalendarAlt,
  FaSignOutAlt,
  FaHospital,
  FaStethoscope,
  FaIdCard,
  FaChartLine,
  FaBell
} from 'react-icons/fa';

export default function DoctorDashboard() {
  const router = useRouter();
  const [doctor, setDoctor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchFin, setSearchFin] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('doctorToken');
    const doctorData = localStorage.getItem('doctorUser');

    if (!token || !doctorData) {
      router.push('/doctor/login');
      return;
    }

    try {
      const parsedDoctor = JSON.parse(doctorData);
      setDoctor(parsedDoctor);
    } catch (error) {
      console.error('Error parsing doctor data:', error);
      router.push('/doctor/login');
      return;
    }

    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('doctorToken');
    localStorage.removeItem('doctorUser');
    router.push('/doctor/login');
  };

  const handlePatientSearch = (e) => {
    e.preventDefault();
    if (searchFin.trim()) {
      router.push(`/doctor/patient/${searchFin.trim()}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-500 mx-auto"></div>
          <div className="text-lg font-medium text-gray-600">Loading doctor portal...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto py-4 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                <FaUserMd className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">MedFayda Doctor Portal</h1>
                <p className="text-sm text-gray-600">Centralized Health Records System</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {doctor.firstName[0]}{doctor.lastName[0]}
                </div>
                <div className="hidden md:block">
                  <div className="text-sm font-semibold text-gray-800">
                    Dr. {doctor.firstName} {doctor.lastName}
                  </div>
                  <div className="text-xs text-gray-500">
                    {doctor.specialization} • {doctor.licenseNumber}
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

      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-2xl shadow-xl p-8 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">
                Welcome back, Dr. {doctor.firstName}! 👨‍⚕️
              </h2>
              <p className="text-blue-100 text-lg mb-4">
                Access centralized patient records from across Ethiopia using Fayda ID Numbers.
              </p>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <p className="text-blue-100 text-sm">
                  🏥 <strong>Hospital:</strong> {doctor.healthCenterId} • <strong>Specialization:</strong> {doctor.specialization}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Patient Search */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <FaSearch className="w-5 h-5 mr-2 text-blue-500" />
            Patient Lookup by FIN
          </h3>
          <form onSubmit={handlePatientSearch} className="flex space-x-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchFin}
                onChange={(e) => setSearchFin(e.target.value)}
                placeholder="Enter patient's Fayda ID Number (FIN)"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
            >
              <FaSearch className="w-4 h-4" />
              <span>Search Patient</span>
            </button>
          </form>
          <div className="mt-3 text-sm text-gray-600">
            <strong>Demo FINs to try:</strong> FIN1753873082364, SMS911234567, DOC001234567
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="group bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-100">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <FaUsers className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-gray-800 text-lg">My Patients</h3>
                <p className="text-sm text-gray-600">
                  View patients under your care
                </p>
              </div>
            </div>
          </div>

          <div className="group bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-100">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <FaFileAlt className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-gray-800 text-lg">Create Record</h3>
                <p className="text-sm text-gray-600">
                  Add new medical records
                </p>
              </div>
            </div>
          </div>

          <div className="group bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-100">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <FaCalendarAlt className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-gray-800 text-lg">Appointments</h3>
                <p className="text-sm text-gray-600">
                  Manage your schedule
                </p>
              </div>
            </div>
          </div>

          <div className="group bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-100">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <FaChartLine className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-gray-800 text-lg">Analytics</h3>
                <p className="text-sm text-gray-600">
                  View patient statistics
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Today's Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Stats */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <FaChartLine className="w-5 h-5 mr-2 text-blue-500" />
              Today's Overview
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FaUsers className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700">Patients Seen</span>
                </div>
                <span className="font-bold text-blue-600">12</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FaFileAlt className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Records Created</span>
                </div>
                <span className="font-bold text-green-600">8</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FaCalendarAlt className="w-5 h-5 text-purple-600" />
                  <span className="text-gray-700">Appointments</span>
                </div>
                <span className="font-bold text-purple-600">15</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <FaBell className="w-5 h-5 mr-2 text-orange-500" />
              Recent Activity
            </h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <FaFileAlt className="w-4 h-4 text-blue-500 mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-gray-800">Created record for patient FIN123456789</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <FaUsers className="w-4 h-4 text-green-500 mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-gray-800">Consultation with patient FIN987654321</p>
                  <p className="text-xs text-gray-500">4 hours ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <FaCalendarAlt className="w-4 h-4 text-purple-500 mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-gray-800">Appointment scheduled for tomorrow</p>
                  <p className="text-xs text-gray-500">6 hours ago</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Info */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <FaHospital className="w-5 h-5 mr-2 text-green-500" />
              Hospital Info
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <FaIdCard className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-800">License</p>
                  <p className="text-xs text-gray-600">{doctor.licenseNumber}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <FaStethoscope className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-800">Specialization</p>
                  <p className="text-xs text-gray-600">{doctor.specialization}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <FaHospital className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-800">Hospital ID</p>
                  <p className="text-xs text-gray-600">{doctor.healthCenterId}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
