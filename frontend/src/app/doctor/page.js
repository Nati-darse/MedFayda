'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaSearch,
  FaUser,
  FaFileAlt,
  FaPlus,
  FaEye,
  FaCalendarAlt,
  FaStethoscope,
  FaSignOutAlt,
  FaHeartbeat,
  FaUserMd
} from 'react-icons/fa';

export default function DoctorPortal() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientRecords, setPatientRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/auth/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'doctor') {
        router.push('/dashboard');
        return;
      }
      setUser(parsedUser);
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/auth/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const searchPatients = async () => {
    if (!searchQuery.trim() || searchQuery.length < 2) return;

    setIsSearching(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/medical-records/search?q=${encodeURIComponent(searchQuery)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.patients);
      } else {
        console.error('Search failed');
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const loadPatientRecords = async (patientFin) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/medical-records/patient/${patientFin}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedPatient(data.patient);
        setPatientRecords(data.records);
      } else {
        console.error('Failed to load patient records');
      }
    } catch (error) {
      console.error('Load records error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectPatient = (patient) => {
    setSelectedPatient(patient);
    loadPatientRecords(patient.fin);
    setSearchResults([]);
    setSearchQuery('');
  };

  if (!user) {
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
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-green-500 rounded-full blur-lg opacity-30 animate-pulse"></div>
                <FaHeartbeat className="relative w-10 h-10 text-red-500" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  MedFayda Doctor Portal
                </h1>
                <p className="text-sm text-gray-500">Centralized Patient Records System</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-lg">
                  <FaUserMd className="w-6 h-6" />
                </div>
                <div className="hidden md:block">
                  <div className="text-sm font-semibold text-gray-800">
                    Dr. {user.firstName} {user.lastName}
                  </div>
                  <div className="text-xs text-gray-500">
                    {user.specialization || 'General Practice'} • FIN: {user.fin}
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Patient Search Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <FaSearch className="w-5 h-5 mr-2 text-blue-500" />
                Patient Lookup
              </h2>
              
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by FIN, name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && searchPatients()}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                  <button
                    onClick={searchPatients}
                    disabled={isSearching || searchQuery.length < 2}
                    className="absolute right-2 top-2 px-4 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSearching ? '...' : 'Search'}
                  </button>
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {searchResults.map((patient) => (
                      <div
                        key={patient.fin}
                        className="p-3 border border-gray-200 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
                        onClick={() => selectPatient(patient)}
                      >
                        <div className="font-semibold text-gray-800">
                          {patient.firstName} {patient.lastName}
                        </div>
                        <div className="text-sm text-gray-600">
                          FIN: {patient.fin} • {patient.gender} • Born: {new Date(patient.dateOfBirth).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Selected Patient Info */}
                {selectedPatient && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
                    <h3 className="font-bold text-gray-800 mb-2 flex items-center">
                      <FaUser className="w-4 h-4 mr-2 text-blue-500" />
                      Selected Patient
                    </h3>
                    <div className="space-y-1 text-sm">
                      <div><strong>Name:</strong> {selectedPatient.firstName} {selectedPatient.lastName}</div>
                      <div><strong>FIN:</strong> {selectedPatient.fin}</div>
                      <div><strong>Gender:</strong> {selectedPatient.gender}</div>
                      <div><strong>DOB:</strong> {new Date(selectedPatient.dateOfBirth).toLocaleDateString()}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Patient Records Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-green-50 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center">
                    <FaFileAlt className="w-5 h-5 mr-2 text-green-500" />
                    Medical Records
                  </h2>
                  {selectedPatient && (
                    <button className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                      <FaPlus className="w-4 h-4" />
                      <span>New Record</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="p-6">
                {!selectedPatient ? (
                  <div className="text-center py-12">
                    <FaStethoscope className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">
                      Search and select a patient to view their medical records
                    </p>
                  </div>
                ) : isLoading ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 border-4 border-blue-200 rounded-full animate-spin border-t-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading patient records...</p>
                  </div>
                ) : patientRecords.length === 0 ? (
                  <div className="text-center py-12">
                    <FaFileAlt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">
                      No medical records found for this patient
                    </p>
                    <button className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                      Create First Record
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {patientRecords.map((record) => (
                      <div key={record.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <FaCalendarAlt className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-800">
                                {new Date(record.visitDate).toLocaleDateString()}
                              </div>
                              <div className="text-sm text-gray-600 capitalize">
                                {record.visitType.replace('_', ' ')}
                              </div>
                            </div>
                          </div>
                          <button className="flex items-center space-x-2 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <FaEye className="w-4 h-4" />
                            <span>View</span>
                          </button>
                        </div>
                        
                        {record.diagnosis && (
                          <div className="mb-2">
                            <strong className="text-gray-700">Diagnosis:</strong>
                            <p className="text-gray-600 mt-1">{record.diagnosis}</p>
                          </div>
                        )}
                        
                        {record.treatment && (
                          <div className="mb-2">
                            <strong className="text-gray-700">Treatment:</strong>
                            <p className="text-gray-600 mt-1">{record.treatment}</p>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between text-sm text-gray-500 mt-3 pt-3 border-t border-gray-100">
                          <span>Dr. {record.doctor?.firstName} {record.doctor?.lastName}</span>
                          <span>{record.healthCenter?.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
