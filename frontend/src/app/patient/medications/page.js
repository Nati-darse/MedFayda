'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaPills,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaArrowLeft,
  FaCalendarAlt,
  FaUserMd,
  FaBell,
  FaTimesCircle
} from 'react-icons/fa';

export default function PatientMedications() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [medications, setMedications] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock medications and reminders data
  const mockMedications = [
    {
      id: 1,
      name: 'Amlodipine',
      dosage: '5mg',
      frequency: 'Once daily',
      prescribedBy: 'Dr. Abebe Kebede',
      prescribedDate: '2024-01-15',
      instructions: 'Take with or without food, preferably at the same time each day',
      purpose: 'Blood pressure control',
      isActive: true,
      nextDose: '2024-02-15 08:00'
    },
    {
      id: 2,
      name: 'Aspirin',
      dosage: '81mg',
      frequency: 'Once daily',
      prescribedBy: 'Dr. Abebe Kebede',
      prescribedDate: '2024-01-15',
      instructions: 'Take with food to reduce stomach irritation',
      purpose: 'Heart protection',
      isActive: true,
      nextDose: '2024-02-15 20:00'
    },
    {
      id: 3,
      name: 'Metformin',
      dosage: '500mg',
      frequency: 'Twice daily',
      prescribedBy: 'Dr. Meron Tadesse',
      prescribedDate: '2024-01-20',
      instructions: 'Take with meals to reduce stomach upset',
      purpose: 'Blood sugar control',
      isActive: false,
      endDate: '2024-02-10'
    }
  ];

  const mockReminders = [
    {
      id: 1,
      medicationId: 1,
      medicationName: 'Amlodipine 5mg',
      scheduledTime: '08:00',
      status: 'pending',
      date: '2024-02-15'
    },
    {
      id: 2,
      medicationId: 2,
      medicationName: 'Aspirin 81mg',
      scheduledTime: '20:00',
      status: 'pending',
      date: '2024-02-15'
    },
    {
      id: 3,
      medicationId: 1,
      medicationName: 'Amlodipine 5mg',
      scheduledTime: '08:00',
      status: 'taken',
      date: '2024-02-14'
    }
  ];

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
      
      // Load mock data
      setMedications(mockMedications);
      setReminders(mockReminders);
      
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/auth/login');
      return;
    }

    setIsLoading(false);
  }, [router]);

  const markAsTaken = (reminderId) => {
    setReminders(prev => 
      prev.map(reminder => 
        reminder.id === reminderId 
          ? { ...reminder, status: 'taken' }
          : reminder
      )
    );
  };

  const markAsMissed = (reminderId) => {
    setReminders(prev => 
      prev.map(reminder => 
        reminder.id === reminderId 
          ? { ...reminder, status: 'missed' }
          : reminder
      )
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-500 mx-auto"></div>
          <div className="text-lg font-medium text-gray-600">Loading medications...</div>
        </div>
      </div>
    );
  }

  const activeMedications = medications.filter(med => med.isActive);
  const inactiveMedications = medications.filter(med => !med.isActive);
  const todayReminders = reminders.filter(reminder => reminder.date === '2024-02-15');
  const pendingReminders = todayReminders.filter(reminder => reminder.status === 'pending');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-6xl mx-auto py-4 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
              >
                <FaArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-2xl font-bold text-gray-800">My Medications</h1>
            </div>
            <div className="flex items-center space-x-4">
              {pendingReminders.length > 0 && (
                <div className="flex items-center space-x-2 px-3 py-2 bg-orange-100 text-orange-800 rounded-lg">
                  <FaBell className="w-4 h-4" />
                  <span className="text-sm font-medium">{pendingReminders.length} pending</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Today's Reminders */}
        {todayReminders.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <FaBell className="w-5 h-5 mr-2 text-orange-500" />
              Today's Medication Reminders
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {todayReminders.map((reminder) => (
                <div key={reminder.id} className={`p-4 rounded-lg border-2 ${
                  reminder.status === 'taken' ? 'bg-green-50 border-green-200' :
                  reminder.status === 'missed' ? 'bg-red-50 border-red-200' :
                  'bg-yellow-50 border-yellow-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-800">{reminder.medicationName}</h3>
                    {reminder.status === 'taken' && <FaCheckCircle className="w-5 h-5 text-green-500" />}
                    {reminder.status === 'missed' && <FaTimesCircle className="w-5 h-5 text-red-500" />}
                    {reminder.status === 'pending' && <FaClock className="w-5 h-5 text-yellow-500" />}
                  </div>
                  <div className="text-sm text-gray-600 mb-3">
                    <FaClock className="inline w-4 h-4 mr-1" />
                    {reminder.scheduledTime}
                  </div>
                  {reminder.status === 'pending' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => markAsTaken(reminder.id)}
                        className="flex-1 px-3 py-1 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
                      >
                        Mark as Taken
                      </button>
                      <button
                        onClick={() => markAsMissed(reminder.id)}
                        className="px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
                      >
                        Missed
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Medications */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <FaPills className="w-5 h-5 mr-2 text-blue-500" />
            Current Medications ({activeMedications.length})
          </h2>
          
          {activeMedications.length === 0 ? (
            <div className="text-center py-8">
              <FaPills className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No active medications</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeMedications.map((medication) => (
                <div key={medication.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {medication.name} {medication.dosage}
                        </h3>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                          Active
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                        <div>
                          <strong>Frequency:</strong> {medication.frequency}
                        </div>
                        <div>
                          <strong>Purpose:</strong> {medication.purpose}
                        </div>
                        <div className="flex items-center space-x-1">
                          <FaUserMd className="w-4 h-4" />
                          <span>{medication.prescribedBy}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FaCalendarAlt className="w-4 h-4" />
                          <span>Since {new Date(medication.prescribedDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 rounded-lg p-3">
                        <h4 className="font-medium text-blue-800 mb-1">Instructions</h4>
                        <p className="text-sm text-blue-700">{medication.instructions}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Medication History */}
        {inactiveMedications.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <FaExclamationTriangle className="w-5 h-5 mr-2 text-gray-500" />
              Medication History ({inactiveMedications.length})
            </h2>
            
            <div className="space-y-4">
              {inactiveMedications.map((medication) => (
                <div key={medication.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-600">
                          {medication.name} {medication.dosage}
                        </h3>
                        <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs font-medium rounded-full">
                          Discontinued
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500 mb-3">
                        <div>
                          <strong>Was taking:</strong> {medication.frequency}
                        </div>
                        <div>
                          <strong>Purpose:</strong> {medication.purpose}
                        </div>
                        <div className="flex items-center space-x-1">
                          <FaUserMd className="w-4 h-4" />
                          <span>{medication.prescribedBy}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FaCalendarAlt className="w-4 h-4" />
                          <span>
                            {new Date(medication.prescribedDate).toLocaleDateString()} - {' '}
                            {medication.endDate ? new Date(medication.endDate).toLocaleDateString() : 'Ongoing'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
