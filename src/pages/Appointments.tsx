import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { format, parseISO, isAfter, isBefore, isToday } from 'date-fns';
import * as Tabs from '@radix-ui/react-tabs';
import { Calendar, Clock, User, Users } from 'lucide-react';
import BookAppointment from '../components/BookAppointment';

interface Appointment {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  patient: {
    id: string;
    first_name: string;
    last_name: string;
  };
  staff: {
    id: string;
    first_name: string;
    last_name: string;
    specialization: string;
  };
}

const Appointments = () => {
  const { user, userRole } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBooking, setShowBooking] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, [user, userRole]);

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      setError('');

      let query = supabase
        .from('appointments')
        .select(`
          id,
          start_time,
          end_time,
          status,
          patient:patients(id, first_name, last_name),
          staff:staff(id, first_name, last_name, specialization)
        `);

      if (userRole === 'patient') {
        query = query.eq('patient_id', user?.id);
      } else if (userRole === 'staff') {
        query = query.eq('staff_id', user?.id);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setAppointments(data || []);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to load appointments');
    } finally {
      setIsLoading(false);
    }
  };

  const filterAppointments = (status: 'upcoming' | 'pending' | 'past') => {
    return appointments.filter(appointment => {
      const appointmentDate = parseISO(appointment.start_time);
      const now = new Date();

      switch (status) {
        case 'upcoming':
          return isAfter(appointmentDate, now) && appointment.status === 'confirmed';
        case 'pending':
          return appointment.status === 'pending';
        case 'past':
          return isBefore(appointmentDate, now) || appointment.status === 'completed';
        default:
          return false;
      }
    });
  };

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => (
    <div className="bg-white rounded-lg shadow p-6 mb-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center mb-2">
            <Calendar className="w-5 h-5 text-gray-500 mr-2" />
            <span className="text-lg font-medium">
              {format(parseISO(appointment.start_time), 'MMMM d, yyyy')}
            </span>
          </div>
          <div className="flex items-center mb-2">
            <Clock className="w-5 h-5 text-gray-500 mr-2" />
            <span>
              {format(parseISO(appointment.start_time), 'h:mm a')} - 
              {format(parseISO(appointment.end_time), 'h:mm a')}
            </span>
          </div>
          <div className="flex items-center">
            {userRole === 'patient' ? (
              <div className="flex items-center">
                <User className="w-5 h-5 text-gray-500 mr-2" />
                <span>Dr. {appointment.staff.first_name} {appointment.staff.last_name}</span>
                <span className="text-gray-500 ml-2">({appointment.staff.specialization})</span>
              </div>
            ) : (
              <div className="flex items-center">
                <Users className="w-5 h-5 text-gray-500 mr-2" />
                <span>{appointment.patient.first_name} {appointment.patient.last_name}</span>
              </div>
            )}
          </div>
        </div>
        <div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
            appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
          </span>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
        {userRole === 'patient' && (
          <button
            onClick={() => setShowBooking(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Book Appointment
          </button>
        )}
      </div>

      {error && (
        <div className="mb-8 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      <Tabs.Root defaultValue="upcoming" className="space-y-6">
        <Tabs.List className="flex space-x-4 border-b border-gray-200">
          <Tabs.Trigger
            value="upcoming"
            className="px-4 py-2 text-gray-500 hover:text-gray-700 border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600"
          >
            Upcoming
          </Tabs.Trigger>
          <Tabs.Trigger
            value="pending"
            className="px-4 py-2 text-gray-500 hover:text-gray-700 border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600"
          >
            Pending
          </Tabs.Trigger>
          <Tabs.Trigger
            value="past"
            className="px-4 py-2 text-gray-500 hover:text-gray-700 border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600"
          >
            Past
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="upcoming" className="space-y-4">
          {filterAppointments('upcoming').map(appointment => (
            <AppointmentCard key={appointment.id} appointment={appointment} />
          ))}
          {filterAppointments('upcoming').length === 0 && (
            <p className="text-gray-500 text-center py-8">No upcoming appointments</p>
          )}
        </Tabs.Content>

        <Tabs.Content value="pending" className="space-y-4">
          {filterAppointments('pending').map(appointment => (
            <AppointmentCard key={appointment.id} appointment={appointment} />
          ))}
          {filterAppointments('pending').length === 0 && (
            <p className="text-gray-500 text-center py-8">No pending appointments</p>
          )}
        </Tabs.Content>

        <Tabs.Content value="past" className="space-y-4">
          {filterAppointments('past').map(appointment => (
            <AppointmentCard key={appointment.id} appointment={appointment} />
          ))}
          {filterAppointments('past').length === 0 && (
            <p className="text-gray-500 text-center py-8">No past appointments</p>
          )}
        </Tabs.Content>
      </Tabs.Root>

      {showBooking && (
        <BookAppointment
          onClose={() => setShowBooking(false)}
          onSuccess={() => {
            setShowBooking(false);
            fetchAppointments();
          }}
        />
      )}
    </div>
  );
};

export default Appointments;