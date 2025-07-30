'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  FaUser,
  FaArrowLeft,
  FaFileAlt,
  FaCalendarAlt,
  FaUserMd,
  FaHospital,
  FaHeartbeat,
  FaPills,
  FaFlask,
  FaStethoscope,
  FaPlus,
  FaEdit,
  FaIdCard,
  FaPhone,
  FaEnvelope
} from 'react-icons/fa';

export default function DoctorPatientView() {
  const router = useRouter();
  const params = useParams();
  const fin = params.fin;
  
  const [doctor, setDoctor] = useState(null);
  const [patient, setPatient] = useState(null);
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Mock patient data based on FIN
  const mockPatients = {
    'FIN1753873082364': {
      fin: 'FIN1753873082364',
      firstName: 'Mock',
      lastName: 'User',
      email: 'mock@medfayda.et',
      phoneNumber: '+251911234567',
      dateOfBirth: '1990-01-01',
      gender: 'M',
      address: 'Mock Address, Addis Ababa',
      emergencyContact: 'Emergency Contact (+251911234568)'
    },
    'SMS911234567': {
      fin: 'SMS911234567',
      firstName: 'SMS',
      lastName: 'User',
      phoneNumber: '+251911234567',
      email: 'sms1234@medfayda.et',
      dateOfBirth: '1990-01-01',
      gender: 'O',
      address: 'Address not provided',
      emergencyContact: 'Self (+251911234567)'
    },
    'DOC001234567': {
      fin: 'DOC001234567',
      firstName: 'Test',
      lastName: 'Patient',
      email: 'test.patient@medfayda.et',
      phoneNumber: '+251911111111',
      dateOfBirth: '1985-05-15',
      gender: 'F',
      address: 'Test Address, Addis Ababa',
      emergencyContact: 'Family Member (+251922222222)'
    }
  };

  const mockRecords = [
    {
      id: 1,
      patientFin: fin,
      date: '2024-01-15',
      type: 'consultation',
      doctor: 'Dr. Abebe Kebede',
      hospital: 'Black Lion Hospital',
      diagnosis: 'Hypertension',
      treatment: 'Prescribed Amlodipine 5mg daily, lifestyle modifications recommended',
      medications: ['Amlodipine 5mg - Once daily', 'Aspirin 81mg - Once daily'],
      vitals: { bp: '140/90', pulse: '78', temp: '36.5°C', weight: '70kg' },
      notes: 'Patient advised to reduce salt intake and increase physical activity'
    },
    {
      id: 2,
      patientFin: fin,
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
      notes: 'All laboratory values within normal limits'
    }
  ];

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
      
      // Load patient data
      const patientData = mockPatients[fin];
      if (patientData) {
        setPatient(patientData);
        setRecords(mockRecords);
      } else {
        setError('Patient not found with FIN: ' + fin);
      }
      
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Error loading patient data');
    }

    setIsLoading(false);
  }, [router, fin]);

  const getRecordIcon = (type) => {
    switch (type) {
      case 'consultation': return <FaStethoscope className="w-5 h-5 text-blue-500" />;
      case 'lab_test': return <FaFlask className="w-5 h-5 text-green-500" />;
      case 'follow_up': return <FaHeartbeat className="w-5 h-5 text-orange-500" />;
      case 'vaccination': return <FaPills className="w-5 h-5 text-purple-500" />;
      default: return <FaFileAlt className="w-5 h-5 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-500 mx-auto"></div>
          <div className="text-lg font-medium text-gray-600">Loading patient data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <FaUser className="w-8 h-8 text-red-500" />
          </div>
          <div className="text-lg font-medium text-red-600">{error}</div>
          <button
            onClick={() => router.push('/doctor/dashboard')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Back to Dashboard
          </button>
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
              <button
                onClick={() => router.push('/doctor/dashboard')}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
              >
                <FaArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-2xl font-bold text-gray-800">Patient Records</h1>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-600">
                Viewing as: Dr. {doctor.firstName} {doctor.lastName}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Patient Info Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-6">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {patient.firstName[0]}{patient.lastName[0]}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {patient.firstName} {patient.lastName}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <FaIdCard className="w-4 h-4" />
                    <span><strong>FIN:</strong> {patient.fin}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FaPhone className="w-4 h-4" />
                    <span><strong>Phone:</strong> {patient.phoneNumber}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FaEnvelope className="w-4 h-4" />
                    <span><strong>Email:</strong> {patient.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FaCalendarAlt className="w-4 h-4" />
                    <span><strong>DOB:</strong> {new Date(patient.dateOfBirth).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FaUser className="w-4 h-4" />
                    <span><strong>Gender:</strong> {patient.gender === 'M' ? 'Male' : patient.gender === 'F' ? 'Female' : 'Other'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FaPhone className="w-4 h-4" />
                    <span><strong>Emergency:</strong> {patient.emergencyContact}</span>
                  </div>
                </div>
              </div>
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
              <FaPlus className="w-4 h-4" />
              <span>New Record</span>
            </button>
          </div>
        </div>

        {/* Medical Records */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800 flex items-center">
              <FaFileAlt className="w-5 h-5 mr-2 text-blue-500" />
              Medical Records ({records.length})
            </h3>
          </div>

          {records.length === 0 ? (
            <div className="text-center py-12">
              <FaFileAlt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Medical Records</h3>
              <p className="text-gray-500 mb-4">This patient has no medical records yet.</p>
              <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                Create First Record
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {records.map((record) => (
                <div key={record.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        {getRecordIcon(record.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-lg font-semibold text-gray-800">{record.diagnosis}</h4>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full capitalize">
                            {record.type.replace('_', ' ')}
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
                            <h5 className="font-medium text-blue-800 mb-2">Vital Signs</h5>
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
                            <h5 className="font-medium text-green-800 mb-2">Lab Results</h5>
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
                            <h5 className="font-medium text-purple-800 mb-2">Medications</h5>
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
                          <div className="bg-gray-50 rounded-lg p-3">
                            <h5 className="font-medium text-gray-800 mb-1">Notes</h5>
                            <p className="text-sm text-gray-700">{record.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="flex items-center space-x-1 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <FaEdit className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
