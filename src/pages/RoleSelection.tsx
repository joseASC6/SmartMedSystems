import React from 'react';
import { UserCircle, Stethoscope } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface RoleSelectionProps {
  onNavigate: (page: string) => void;
  onRoleSelect: (role: 'patient' | 'provider') => void;
}

function RoleSelection({ onNavigate, onRoleSelect }: RoleSelectionProps) {
  const { login } = useAuth();

  const handleRoleSelect = (role: 'patient' | 'provider') => {
    console.log('Selected role:', role);
    
    // Create a mock token for demonstration
    const mockToken = 'mock-jwt-token';
    
    // Update auth context
    login(mockToken, role);
    
    // Update parent component state
    onRoleSelect(role);
    
    // Navigate to appropriate dashboard
    const targetPage = role === 'patient' ? 'patient-home' : 'provider-dashboard';
    console.log('Navigating to:', targetPage);
    
    onNavigate(targetPage);
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

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <button
              onClick={() => handleRoleSelect('patient')}
              className="w-full flex items-center justify-center px-8 py-6 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors duration-200"
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
              onClick={() => handleRoleSelect('provider')}
              className="w-full flex items-center justify-center px-8 py-6 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors duration-200"
            >
              <div className="text-center">
                <Stethoscope className="mx-auto h-12 w-12 text-blue-600" />
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-gray-900">I'm a Healthcare Provider</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Manage patient records, schedule appointments, and provide virtual consultations
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