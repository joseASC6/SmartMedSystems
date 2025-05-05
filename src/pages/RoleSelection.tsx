import React, { useState } from 'react';
import { UserCircle, Stethoscope } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface RoleSelectionProps {
  onNavigate: (page: string) => void;
  onRoleSelect: (role: 'patient' | 'staff') => void;
}

function RoleSelection({ onNavigate, onRoleSelect }: RoleSelectionProps) {
  const { user, login } = useAuth();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleSelect = async (roleType: 'patient' | 'staff') => {
    try {
      setIsLoading(true);
      setError('');

      if (!user?.id) {
        throw new Error('User not found');
      }

      const roleId = roleType === 'patient' ? 1 : 2;

      // Create user_role entry
      const { error: roleError } = await supabase
        .from('user_role')
        .insert({
          role_id: roleId,
          user_id: user.id,
          created_at: new Date().toISOString()
        });

      if (roleError) throw roleError;

      // Update auth context with role
      login(user.id, roleType);
      
      // Update parent component state
      onRoleSelect(roleType);
      
      // Navigate to appropriate data collection form
      onNavigate(roleType === 'patient' ? 'patient-data' : 'staff-data');
    } catch (err) {
      console.error('Role selection error:', err);
      setError(err instanceof Error ? err.message : 'Failed to set user role');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Choose your role
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Select how you'll be using SmartMed Systems
        </p>
      </div>

      {error && (
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        </div>
      )}

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <button
              onClick={() => handleRoleSelect('patient')}
              disabled={isLoading}
              className="w-full flex items-center justify-center px-8 py-6 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-center">
                <UserCircle className="mx-auto h-12 w-12 text-blue-600" />
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-gray-900">I'm a Patient</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Access your health records, book appointments, and connect with healthcare providers
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleRoleSelect('staff')}
              disabled={isLoading}
              className="w-full flex items-center justify-center px-8 py-6 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-center">
                <Stethoscope className="mx-auto h-12 w-12 text-blue-600" />
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-gray-900">I'm a Staff Member</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Join our healthcare team to provide care and support to patients
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoleSelection;