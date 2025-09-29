'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaFileAlt,
  FaCalendarAlt,
  FaUserMd,
  FaHospital,
  FaEye,
  FaDownload,
  FaFilter,
  FaSearch,
  FaArrowLeft,
  FaHeartbeat,
  FaPills,
  FaFlask,
  FaTimes,
  FaStethoscope
} from 'react-icons/fa';

export default function PatientRecords() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Mock medical records data
  const mockRecords = [
    {
      id: 1,
      date: '2024-01-15',
      type: 'consultation',
      doctor: 'Dr. Abebe Kebede',
      hospital: 'Black Lion Hospital',
      diagnosis: 'Hypertension',
      treatment: 'Prescribed Amlodipine 5mg daily, lifestyle modifications recommended',
      medications: ['Amlodipine 5mg - Once daily', 'Aspirin 81mg - Once daily'],
      vitals: { bp: '140/90', pulse: '78', temp: '36.5°C', weight: '70kg' },
      notes: 'Patient advised to reduce salt intake and increase physical activity',
      followUp: '2024-02-15'
    },
    {
      id: 2,
      date: '2024-01-20',
      type: 'lab_test',
      doctor: 'Dr. Meron Tadesse',
      hospital: 'Tikur Anbessa Hospital',
      diagnosis: 'Blood Chemistry Panel',
      treatment: 'Laboratory investigation',
      labResults: {
        'Blood Sugar': '95 mg/dL (Normal)',
        'Cholesterol': '180 mg/dL (Normal)',
        'Hemoglobin': '14.2 g/dL (Normal)',
        'Creatinine': '1.0 mg/dL (Normal)'
      },
      notes: 'All laboratory values within normal limits',
      followUp: null
    },
    {
      id: 3,
      date: '2024-02-10',
      type: 'follow_up',
      doctor: 'Dr. Abebe Kebede',
      hospital: 'Black Lion Hospital',
      diagnosis: 'Hypertension - Follow-up',
      treatment: 'Blood pressure well controlled, continue current medication',
      medications: ['Amlodipine 5mg - Once daily', 'Aspirin 81mg - Once daily'],
      vitals: { bp: '125/80', pulse: '72', temp: '36.2°C', weight: '68kg' },
      notes: 'Patient showing good response to treatment. Weight loss of 2kg noted.',
      followUp: '2024-05-10'
    },
    {
      id: 4,
      date: '2024-02-25',
      type: 'vaccination',
      doctor: 'Nurse Almaz Worku',
      hospital: 'Bole Health Center',
      diagnosis: 'COVID-19 Booster Vaccination',
      treatment: 'Pfizer-BioNTech COVID-19 vaccine administered',
      medications: [],
      notes: 'No adverse reactions observed. Patient advised to monitor for side effects.',
      followUp: null
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
      
      // Load mock records
      setRecords(mockRecords);
      setFilteredRecords(mockRecords);
      
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/auth/login');
      return;
    }

    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    let filtered = records;

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(record => record.type === filterType);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.hospital.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRecords(filtered);
  }, [records, filterType, searchTerm]);

  const getRecordIcon = (type) => {
    switch (type) {
      case 'consultation': return <FaStethoscope className="w-5 h-5 text-blue-500" />;
      case 'lab_test': return <FaFlask className="w-5 h-5 text-green-500" />;
      case 'follow_up': return <FaHeartbeat className="w-5 h-5 text-orange-500" />;
      case 'vaccination': return <FaPills className="w-5 h-5 text-purple-500" />;
      default: return <FaFileAlt className="w-5 h-5 text-gray-500" />;
    }
  };

  const getRecordTypeLabel = (type) => {
    switch (type) {
      case 'consultation': return 'Consultation';
      case 'lab_test': return 'Lab Test';
      case 'follow_up': return 'Follow-up';
      case 'vaccination': return 'Vaccination';
      default: return 'Medical Record';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-500 mx-auto"></div>
          <div className="text-lg font-medium text-gray-600">Loading medical records...</div>
        </div>
      </div>
    );
  }

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
              <h1 className="text-2xl font-bold text-gray-800">My Medical Records</h1>
            </div>
            <div className="text-sm text-gray-600">
              Total Records: {filteredRecords.length}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search records..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex items-center space-x-2">
                <FaFilter className="text-gray-500 w-4 h-4" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Records</option>
                  <option value="consultation">Consultations</option>
                  <option value="lab_test">Lab Tests</option>
                  <option value="follow_up">Follow-ups</option>
                  <option value="vaccination">Vaccinations</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Records List */}
        <div className="space-y-4">
          {filteredRecords.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
              <FaFileAlt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Records Found</h3>
              <p className="text-gray-500">
                {searchTerm || filterType !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Your medical records will appear here once you visit healthcare providers.'}
              </p>
            </div>
          ) : (
            filteredRecords.map((record) => (
              <div key={record.id} className="bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        {getRecordIcon(record.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-800">{record.diagnosis}</h3>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                            {getRecordTypeLabel(record.type)}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center space-x-2">
                            <FaCalendarAlt className="w-4 h-4" />
                            <span>{new Date(record.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <FaUserMd className="w-4 h-4" />
                            <span>{record.doctor}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <FaHospital className="w-4 h-4" />
                            <span>{record.hospital}</span>
                          </div>
                        </div>
                        <p className="text-gray-700 mb-3">{record.treatment}</p>
                        
                        {/* Vitals */}
                        {record.vitals && (
                          <div className="bg-blue-50 rounded-lg p-3 mb-3">
                            <h4 className="font-medium text-blue-800 mb-2">Vital Signs</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                              {Object.entries(record.vitals).map(([key, value]) => (
                                <div key={key} className="text-blue-700">
                                  <span className="font-medium capitalize">{key}:</span> {value}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Lab Results */}
                        {record.labResults && (
                          <div className="bg-green-50 rounded-lg p-3 mb-3">
                            <h4 className="font-medium text-green-800 mb-2">Lab Results</h4>
                            <div className="space-y-1 text-sm">
                              {Object.entries(record.labResults).map(([test, result]) => (
                                <div key={test} className="text-green-700">
                                  <span className="font-medium">{test}:</span> {result}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Medications */}
                        {record.medications && record.medications.length > 0 && (
                          <div className="bg-purple-50 rounded-lg p-3 mb-3">
                            <h4 className="font-medium text-purple-800 mb-2">Medications</h4>
                            <ul className="space-y-1 text-sm text-purple-700">
                              {record.medications.map((med, index) => (
                                <li key={index} className="flex items-center space-x-2">
                                  <FaPills className="w-3 h-3" />
                                  <span>{med}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {record.notes && (
                          <div className="bg-gray-50 rounded-lg p-3 mb-3">
                            <h4 className="font-medium text-gray-800 mb-1">Notes</h4>
                            <p className="text-sm text-gray-700">{record.notes}</p>
                          </div>
                        )}

                        {record.followUp && (
                          <div className="text-sm text-orange-600">
                            <strong>Follow-up:</strong> {new Date(record.followUp).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedRecord(record)}
                        className="flex items-center space-x-1 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <FaEye className="w-4 h-4" />
                        <span>View</span>
                      </button>
                      <button className="flex items-center space-x-1 px-3 py-1 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                        <FaDownload className="w-4 h-4" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Record Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Medical Record Details</h2>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Date:</strong> {new Date(selectedRecord.date).toLocaleDateString()}
                  </div>
                  <div>
                    <strong>Type:</strong> {getRecordTypeLabel(selectedRecord.type)}
                  </div>
                  <div>
                    <strong>Doctor:</strong> {selectedRecord.doctor}
                  </div>
                  <div>
                    <strong>Hospital:</strong> {selectedRecord.hospital}
                  </div>
                </div>
                
                <div>
                  <strong>Diagnosis:</strong>
                  <p className="mt-1 text-gray-700">{selectedRecord.diagnosis}</p>
                </div>
                
                <div>
                  <strong>Treatment:</strong>
                  <p className="mt-1 text-gray-700">{selectedRecord.treatment}</p>
                </div>
                
                {selectedRecord.notes && (
                  <div>
                    <strong>Notes:</strong>
                    <p className="mt-1 text-gray-700">{selectedRecord.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
