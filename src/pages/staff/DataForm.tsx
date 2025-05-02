import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface StaffDataFormProps {
  onNavigate: (page: string) => void;
}

function StaffDataForm({ onNavigate }: StaffDataFormProps) {
  const { userRole } = useAuth();
  const [formData, setFormData] = useState({
    staff_role: '',
  });

  const staffRoles = [
    'Manager',
    'Doctor',
    'Virtual Nurse',
    'Local Nurse',
    'Receptionist',
    'IT Staff'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Staff data:', formData);
    // Here we would normally save the data to the database
    onNavigate('staff-dashboard');
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
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
          Complete Your Staff Profile
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="staff_role" className="block text-sm font-medium text-gray-700">
                Staff Role
              </label>
              <div className="mt-1">
                <select
                  name="staff_role"
                  id="staff_role"
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.staff_role}
                  onChange={handleChange}
                >
                  <option value="">Select your role</option>
                  {staffRoles.map(role => (
                    <option key={role} value={role.toLowerCase().replace(' ', '_')}>
                      {role}
                    </option>
                  ))}
                </select>
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

export default StaffDataForm;