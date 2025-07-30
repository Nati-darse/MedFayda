'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaCalendarAlt,
  FaUserMd,
  FaHospital,
  FaClock,
  FaPlus,
  FaEdit,
  FaTrash,
  FaArrowLeft,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationCircle,
  FaFilter
} from 'react-icons/fa';

export default function PatientAppointments() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showNewAppointment, setShowNewAppointment] = useState(false);

  // Mock appointments data
  const mockAppointments = [
    {
      id: 1,
      date: '2024-02-15',
      time: '09:00',
      doctor: 'Dr. Abebe Kebede',
      specialization: 'Cardiologist',
      hospital: 'Black Lion Hospital',
      type: 'Follow-up',
      status: 'confirmed',
      notes: 'Blood pressure check and medication review'
    },
    {
      id: 2,
      date: '2024-02-20',
      time: '14:30',
      doctor: 'Dr. Meron Tadesse',
      specialization: 'General Practitioner',
      hospital: 'Tikur Anbessa Hospital',
      type: 'Consultation',
      status: 'pending',
      notes: 'Annual health checkup'
    },
    {
      id: 3,
      date: '2024-01-10',
      time: '11:00',
      doctor: 'Dr. Yohannes Alemu',
      specialization: 'Orthopedist',
      hospital: 'Zewditu Memorial Hospital',
      type: 'Consultation',
      status: 'completed',
      notes: 'Knee pain evaluation - completed successfully'
    },
    {
      id: 4,
      date: '2024-01-05',
      time: '16:00',
      doctor: 'Dr. Almaz Worku',
      specialization: 'Dermatologist',
      hospital: 'Bole Health Center',
      type: 'Treatment',
      status: 'cancelled',
      notes: 'Skin condition treatment - cancelled by patient'
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
      
      // Load mock appointments
      setAppointments(mockAppointments);
      setFilteredAppointments(mockAppointments);
      
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/auth/login');
      return;
    }

    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    let filtered = appointments;

    if (filterStatus !== 'all') {
      filtered = filtered.filter(appointment => appointment.status === filterStatus);
    }

    // Sort by date (upcoming first)
    filtered.sort((a, b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time));

    setFilteredAppointments(filtered);
  }, [appointments, filterStatus]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return <FaCheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending': return <FaExclamationCircle className="w-5 h-5 text-yellow-500" />;
      case 'completed': return <FaCheckCircle className="w-5 h-5 text-blue-500" />;
      case 'cancelled': return <FaTimesCircle className="w-5 h-5 text-red-500" />;
      default: return <FaClock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isUpcoming = (date, time) => {
    const appointmentDateTime = new Date(date + ' ' + time);
    return appointmentDateTime > new Date();
  };

  const handleCancelAppointment = (appointmentId) => {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === appointmentId 
            ? { ...apt, status: 'cancelled' }
            : apt
        )
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-500 mx-auto"></div>
          <div className="text-lg font-medium text-gray-600">Loading appointments...</div>
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
              <h1 className="text-2xl font-bold text-gray-800">My Appointments</h1>
            </div>
            <button
              onClick={() => setShowNewAppointment(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <FaPlus className="w-4 h-4" />
              <span>Book Appointment</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-6">
          <div className="flex items-center space-x-4">
            <FaFilter className="text-gray-500 w-4 h-4" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Appointments</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <div className="text-sm text-gray-600">
              Showing {filteredAppointments.length} appointment(s)
            </div>
          </div>
        </div>

        {/* Appointments List */}
        <div className="space-y-4">
          {filteredAppointments.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
              <FaCalendarAlt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Appointments Found</h3>
              <p className="text-gray-500 mb-4">
                {filterStatus !== 'all' 
                  ? `No ${filterStatus} appointments found.`
                  : 'You have no appointments scheduled.'}
              </p>
              <button
                onClick={() => setShowNewAppointment(true)}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Book Your First Appointment
              </button>
            </div>
          ) : (
            filteredAppointments.map((appointment) => (
              <div key={appointment.id} className="bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        {getStatusIcon(appointment.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-800">{appointment.type}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(appointment.status)}`}>
                            {appointment.status}
                          </span>
                          {isUpcoming(appointment.date, appointment.time) && appointment.status === 'confirmed' && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                              Upcoming
                            </span>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center space-x-2">
                            <FaCalendarAlt className="w-4 h-4" />
                            <span>{new Date(appointment.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <FaClock className="w-4 h-4" />
                            <span>{appointment.time}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <FaUserMd className="w-4 h-4" />
                            <span>{appointment.doctor}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <FaHospital className="w-4 h-4" />
                            <span>{appointment.hospital}</span>
                          </div>
                        </div>

                        <div className="text-sm text-gray-600 mb-2">
                          <strong>Specialization:</strong> {appointment.specialization}
                        </div>

                        {appointment.notes && (
                          <div className="bg-gray-50 rounded-lg p-3">
                            <h4 className="font-medium text-gray-800 mb-1">Notes</h4>
                            <p className="text-sm text-gray-700">{appointment.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2">
                      {appointment.status === 'pending' && (
                        <button className="flex items-center space-x-1 px-3 py-1 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                          <FaCheckCircle className="w-4 h-4" />
                          <span>Confirm</span>
                        </button>
                      )}
                      
                      {(appointment.status === 'confirmed' || appointment.status === 'pending') && isUpcoming(appointment.date, appointment.time) && (
                        <>
                          <button className="flex items-center space-x-1 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <FaEdit className="w-4 h-4" />
                            <span>Reschedule</span>
                          </button>
                          <button
                            onClick={() => handleCancelAppointment(appointment.id)}
                            className="flex items-center space-x-1 px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <FaTrash className="w-4 h-4" />
                            <span>Cancel</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* New Appointment Modal */}
      {showNewAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Book New Appointment</h2>
                <button
                  onClick={() => setShowNewAppointment(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimesCircle className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hospital</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">Select Hospital</option>
                    <option value="black-lion">Black Lion Hospital</option>
                    <option value="tikur-anbessa">Tikur Anbessa Hospital</option>
                    <option value="zewditu">Zewditu Memorial Hospital</option>
                    <option value="bole">Bole Health Center</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">Select Specialization</option>
                    <option value="general">General Practice</option>
                    <option value="cardiology">Cardiology</option>
                    <option value="orthopedics">Orthopedics</option>
                    <option value="dermatology">Dermatology</option>
                    <option value="pediatrics">Pediatrics</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date</label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Time</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">Select Time</option>
                    <option value="09:00">09:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="14:00">02:00 PM</option>
                    <option value="15:00">03:00 PM</option>
                    <option value="16:00">04:00 PM</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Visit</label>
                  <textarea
                    rows="3"
                    placeholder="Describe your symptoms or reason for the appointment..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  ></textarea>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => {
                      alert('Appointment request submitted! You will receive a confirmation shortly.');
                      setShowNewAppointment(false);
                    }}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Book Appointment
                  </button>
                  <button
                    onClick={() => setShowNewAppointment(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
