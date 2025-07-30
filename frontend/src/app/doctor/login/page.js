'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaUserMd,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaHeartbeat,
  FaSignInAlt,
  FaSpinner,
  FaIdCard,
  FaHospital
} from 'react-icons/fa';

export default function DoctorLogin() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    licenseNumber: '',
    password: '',
    hospitalId: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Validate form
      if (!formData.licenseNumber || !formData.password || !formData.hospitalId) {
        setError('Please fill in all fields');
        setIsLoading(false);
        return;
      }

      // Mock doctor authentication (replace with real API call)
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call

      // Mock doctor credentials for testing
      const mockDoctors = [
        {
          licenseNumber: 'MD001',
          password: 'doctor123',
          hospitalId: 'HC001',
          firstName: 'Abebe',
          lastName: 'Kebede',
          specialization: 'Cardiology',
          fin: 'DOC001234567',
          email: 'abebe.kebede@blacklion.gov.et'
        },
        {
          licenseNumber: 'MD002',
          password: 'doctor123',
          hospitalId: 'HC002',
          firstName: 'Meron',
          lastName: 'Tadesse',
          specialization: 'General Practice',
          fin: 'DOC002345678',
          email: 'meron.tadesse@tikuranbessa.gov.et'
        }
      ];

      const doctor = mockDoctors.find(
        d => d.licenseNumber === formData.licenseNumber && 
             d.password === formData.password &&
             d.hospitalId === formData.hospitalId
      );

      if (!doctor) {
        setError('Invalid credentials. Please check your license number, password, and hospital ID.');
        setIsLoading(false);
        return;
      }

      // Create doctor session
      const doctorData = {
        id: 'doctor-' + Date.now(),
        faydaId: doctor.fin,
        fin: doctor.fin,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        email: doctor.email,
        role: 'doctor',
        specialization: doctor.specialization,
        licenseNumber: doctor.licenseNumber,
        healthCenterId: doctor.hospitalId
      };

      // Generate mock JWT token
      const token = 'doctor-jwt-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);

      // Store in localStorage
      localStorage.setItem('doctorToken', token);
      localStorage.setItem('doctorUser', JSON.stringify(doctorData));

      // Redirect to doctor portal
      router.push('/doctor/dashboard');

    } catch (error) {
      console.error('Doctor login error:', error);
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="relative mx-auto w-20 h-20 mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-green-500 rounded-full blur-lg opacity-30 animate-pulse"></div>
            <div className="relative w-20 h-20 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
              <FaHeartbeat className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-2">
            MedFayda Doctor Portal
          </h1>
          <p className="text-gray-600">
            Secure access for healthcare professionals
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FaUserMd className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 ml-3">Doctor Login</h2>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* License Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaIdCard className="inline w-4 h-4 mr-2" />
                Medical License Number
              </label>
              <input
                type="text"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleInputChange}
                placeholder="Enter your license number (e.g., MD001)"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                disabled={isLoading}
              />
            </div>

            {/* Hospital ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaHospital className="inline w-4 h-4 mr-2" />
                Hospital ID
              </label>
              <select
                name="hospitalId"
                value={formData.hospitalId}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                disabled={isLoading}
              >
                <option value="">Select your hospital</option>
                <option value="HC001">HC001 - Black Lion Hospital</option>
                <option value="HC002">HC002 - Tikur Anbessa Hospital</option>
                <option value="HC003">HC003 - Zewditu Memorial Hospital</option>
                <option value="HC004">HC004 - Adama Hospital Medical College</option>
                <option value="HC005">HC005 - Jimma University Medical Center</option>
                <option value="HC006">HC006 - University of Gondar Hospital</option>
                <option value="HC007">HC007 - Dessie Referral Hospital</option>
                <option value="HC008">HC008 - Mekelle Hospital</option>
                <option value="HC009">HC009 - Hawassa University Referral Hospital</option>
                <option value="HC010">HC010 - Dire Dawa Regional Hospital</option>
              </select>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaLock className="inline w-4 h-4 mr-2" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={isLoading}
                >
                  {showPassword ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-green-500 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-600 hover:to-green-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <FaSpinner className="w-5 h-5 mr-2 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  <FaSignInAlt className="w-5 h-5 mr-2" />
                  Sign In to Doctor Portal
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">Demo Credentials:</h3>
            <div className="text-xs text-blue-700 space-y-1">
              <div><strong>License:</strong> MD001 | <strong>Hospital:</strong> HC001 | <strong>Password:</strong> doctor123</div>
              <div><strong>License:</strong> MD002 | <strong>Hospital:</strong> HC002 | <strong>Password:</strong> doctor123</div>
            </div>
          </div>

          {/* Back to Patient Portal */}
          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/')}
              className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              ← Back to Patient Portal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
