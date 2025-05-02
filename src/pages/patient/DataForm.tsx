import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface PatientDataFormProps {
  onNavigate: (page: string) => void;
}

function PatientDataForm({ onNavigate }: PatientDataFormProps) {
  const { userRole } = useAuth();
  const [formData, setFormData] = useState({
    date_of_birth: '',
    gender: '',
    blood_type: '',
    insurance_provider: '',
  });

  const genderOptions = [
    'Male',
    'Female',
    'Non-binary',
    'Other',
    'Prefer not to say'
  ];

  const bloodTypes = [
    'A+', 'A-',
    'B+', 'B-',
    'AB+', 'AB-',
    'O+', 'O-',
    'Unknown'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Patient data:', formData);
    // Here we would normally save the data to the database
    onNavigate('patient-home');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Complete Your Patient Profile
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700">
                Date of Birth
              </label>
              <div className="mt-1">
                <input
                  type="date"
                  name="date_of_birth"
                  id="date_of_birth"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                Gender
              </label>
              <div className="mt-1">
                <select
                  name="gender"
                  id="gender"
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="">Select gender</option>
                  {genderOptions.map(option => (
                    <option key={option} value={option.toLowerCase()}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="blood_type" className="block text-sm font-medium text-gray-700">
                Blood Type
              </label>
              <div className="mt-1">
                <select
                  name="blood_type"
                  id="blood_type"
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.blood_type}
                  onChange={handleChange}
                >
                  <option value="">Select blood type</option>
                  {bloodTypes.map(type => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="insurance_provider" className="block text-sm font-medium text-gray-700">
                Insurance Provider (Optional)
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="insurance_provider"
                  id="insurance_provider"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.insurance_provider}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Complete Profile
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default PatientDataForm;