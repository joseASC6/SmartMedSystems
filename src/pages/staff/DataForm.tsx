import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface Department {
  department_id: number;
  name: string;
}

function StaffDataForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [formData, setFormData] = useState({
    staff_role: '',
    department_id: '',
    specialization: '',
  });

  const staffRoles = [
    { id: 3, name: 'Manager' },
    { id: 4, name: 'Doctor' },
    { id: 5, name: 'Virtual Nurse' },
    { id: 6, name: 'Local Nurse' },
    { id: 7, name: 'Receptionist' },
    { id: 8, name: 'IT Staff' }
  ];

  useEffect(() => {
    const fetchDepartments = async () => {
      const { data, error } = await supabase
        .from('departments')
        .select('department_id, name')
        .order('name');

      if (error) {
        console.error('Error fetching departments:', error);
        return;
      }

      setDepartments(data || []);
    };

    fetchDepartments();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      setError('User not found');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Create user_role entry
      const { error: roleError } = await supabase
        .from('user_role')
        .insert({
          role_id: parseInt(formData.staff_role),
          user_id: user.id,
          created_at: new Date().toISOString()
        });

      if (roleError) throw roleError;

      // Create staff entry
      const staffId = crypto.randomUUID();
      const { error: staffError } = await supabase
        .from('staff')
        .insert({
          staff_id: staffId,
          user_id: user.id,
          department_id: parseInt(formData.department_id),
          specialization: formData.specialization || null,
          hire_date: new Date().toISOString().split('T')[0]
        });

      if (staffError) throw staffError;

      navigate('/staff-dashboard');
    } catch (err) {
      console.error('Staff registration error:', err);
      setError(err instanceof Error ? err.message : 'Failed to complete registration');
    } finally {
      setIsLoading(false);
    }
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
          Complete Your Staff Profile
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              {error}
            </div>
          )}

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
                  disabled={isLoading}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.staff_role}
                  onChange={handleChange}
                >
                  <option value="">Select your role</option>
                  {staffRoles.map(role => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="department_id" className="block text-sm font-medium text-gray-700">
                Department
              </label>
              <div className="mt-1">
                <select
                  name="department_id"
                  id="department_id"
                  required
                  disabled={isLoading}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.department_id}
                  onChange={handleChange}
                >
                  <option value="">Select department</option>
                  {departments.map(dept => (
                    <option key={dept.department_id} value={dept.department_id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="specialization" className="block text-sm font-medium text-gray-700">
                Specialization (Optional)
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="specialization"
                  id="specialization"
                  disabled={isLoading}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.specialization}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Completing Profile...' : 'Complete Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default StaffDataForm;