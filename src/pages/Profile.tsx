import React, { useState, useEffect } from 'react';
import { User, Calendar, Building2, Activity } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';

interface UserProfile {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  created_at: string;
}

interface PatientDetails {
  blood_type: string;
  date_of_birth: string;
  gender: string;
  insurance_provider: string | null;
  primary_provider_name?: string;
}

interface StaffDetails {
  department_name: string;
  specialization: string | null;
  hire_date: string;
}

const Profile = () => {
  const { user, userRole } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [patientDetails, setPatientDetails] = useState<PatientDetails | null>(null);
  const [staffDetails, setStaffDetails] = useState<StaffDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      if (userRole === 'patient') {
        fetchPatientDetails();
      } else if (userRole === 'staff') {
        fetchStaffDetails();
      }
    }
  }, [user, userRole]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('Failed to load user profile');
    }
  };

  const fetchPatientDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select(`
          *,
          staff:primary_provider_id (
            users (
              first_name,
              last_name
            )
          )
        `)
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;

      setPatientDetails({
        ...data,
        primary_provider_name: data.staff 
          ? `Dr. ${data.staff.users.first_name} ${data.staff.users.last_name}`
          : 'Not assigned'
      });
    } catch (error) {
      console.error('Error fetching patient details:', error);
      setError('Failed to load patient details');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStaffDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('staff')
        .select(`
          *,
          departments!fk_staff_department (
            name
          )
        `)
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;

      setStaffDetails({
        department_name: data.departments?.name || 'Not assigned',
        specialization: data.specialization,
        hire_date: data.hire_date
      });
    } catch (error) {
      console.error('Error fetching staff details:', error);
      setError('Failed to load staff details');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 px-6 py-4">
            <div className="flex items-center">
              <div className="p-2 bg-white bg-opacity-25 rounded-full">
                <User className="h-6 w-6 text-white" />
              </div>
              <h1 className="ml-3 text-2xl font-bold text-white">Profile</h1>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
              {error}
            </div>
          )}

          {/* Basic Information */}
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Name</label>
                <p className="font-medium">{profile?.first_name} {profile?.last_name}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Email</label>
                <p className="font-medium">{profile?.email}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Phone Number</label>
                <p className="font-medium">{profile?.phone_number}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Member Since</label>
                <p className="font-medium">
                  {profile?.created_at && format(new Date(profile.created_at), 'MMMM d, yyyy')}
                </p>
              </div>
            </div>
          </div>

          {/* Role-specific Information */}
          {userRole === 'patient' && patientDetails && (
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold mb-4">Patient Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Date of Birth</label>
                  <p className="font-medium">
                    {format(new Date(patientDetails.date_of_birth), 'MMMM d, yyyy')}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Gender</label>
                  <p className="font-medium">{patientDetails.gender}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Blood Type</label>
                  <p className="font-medium">{patientDetails.blood_type}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Insurance Provider</label>
                  <p className="font-medium">{patientDetails.insurance_provider || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Primary Care Provider</label>
                  <p className="font-medium">{patientDetails.primary_provider_name}</p>
                </div>
              </div>
            </div>
          )}

          {userRole === 'staff' && staffDetails && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Staff Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Department</label>
                  <p className="font-medium">{staffDetails.department_name}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Specialization</label>
                  <p className="font-medium">{staffDetails.specialization || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Hire Date</label>
                  <p className="font-medium">
                    {format(new Date(staffDetails.hire_date), 'MMMM d, yyyy')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;