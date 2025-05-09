import React, { useState, useEffect } from 'react';
import { format, parseISO, isAfter, isBefore, isToday } from 'date-fns';
import { Calendar, Clock, User, X, ChevronDown, Info, ExternalLink } from 'lucide-react';
import { Dialog } from '@headlessui/react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Doctor {
  staff_id: string;
  user_id: string;
  specialization: string;
  users: {
    first_name: string;
    last_name: string;
  };
}

interface TimeSlot {
  time_slot_id: number;
  schedule_id: string;
  start_time: string;
  end_time: string;
  status: string;
}

interface Appointment {
  appointment_id: number;
  patient_id: string;
  staff_id: string;
  time_slot_id: number;
  status: string;
  doctor_name: string;
  start_time: string;
  end_time: string;
}

interface Patient {
  patient_id: string;
  user_id: string;
  first_name: string;
  last_name: string;
}

const Appointments = () => {
  const { user, userRole } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [patientId, setPatientId] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchAppointments();
    if (userRole === 'patient') {
      fetchDoctors();
      fetchPatientId();
    } else if (userRole === 'staff') {
      fetchDoctors();
      fetchPatients();
    }
  }, [user, userRole]);

  const fetchPatientId = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('patient_id')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setPatientId(data.patient_id);
    } catch (error) {
      console.error('Error fetching patient ID:', error);
      setError('Failed to load patient information');
    }
  };

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select(`
          patient_id,
          user_id,
          users (
            first_name,
            last_name
          )
        `);

      if (error) throw error;

      const formattedPatients = data.map(patient => ({
        patient_id: patient.patient_id,
        user_id: patient.user_id,
        first_name: patient.users.first_name,
        last_name: patient.users.last_name
      }));

      setPatients(formattedPatients);
    } catch (error) {
      console.error('Error fetching patients:', error);
      setError('Failed to load patients');
    }
  };

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      let query = supabase
        .from('appointments')
        .select(`
          appointment_id,
          patient_id,
          staff_id,
          time_slot_id,
          status,
          time_slots (
            start_time,
            end_time
          ),
          staff:staff_id (
            users (
              first_name,
              last_name
            )
          )
        `);

      if (userRole === 'patient') {
        const { data: patientData, error: patientError } = await supabase
          .from('patients')
          .select('patient_id')
          .eq('user_id', user?.id)
          .single();

        if (patientError) throw patientError;
        query = query.eq('patient_id', patientData.patient_id);
      }

      const { data, error } = await query;

      if (error) throw error;

      const formattedAppointments = data.map(appointment => ({
        ...appointment,
        doctor_name: `${appointment.staff.users.first_name} ${appointment.staff.users.last_name}`,
        start_time: appointment.time_slots.start_time,
        end_time: appointment.time_slots.end_time
      }));

      setAppointments(formattedAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError('Failed to load appointments');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const { data: doctorUserIds, error: userRoleError } = await supabase
        .from('user_role')
        .select('user_id')
        .eq('role_id', 4);

      if (userRoleError) throw userRoleError;

      if (!doctorUserIds || doctorUserIds.length === 0) {
        setDoctors([]);
        return;
      }

      const { data, error } = await supabase
        .from('staff')
        .select(`
          staff_id,
          user_id,
          specialization,
          users (
            first_name,
            last_name
          )
        `)
        .in('user_id', doctorUserIds.map(d => d.user_id));

      if (error) throw error;

      const formattedDoctors = data as Doctor[];
      setDoctors(formattedDoctors);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setError('Failed to load doctors');
    }
  };

  const fetchAvailableTimeSlots = async () => {
    if (!selectedDoctor || !selectedDate) return;

    try {
      const { data: scheduleData, error: scheduleError } = await supabase
        .from('schedules')
        .select('*')
        .eq('staff_id', selectedDoctor)
        .eq('date', selectedDate)
        .single();

      if (scheduleError && !scheduleError.message.includes('no rows')) throw scheduleError;

      let schedule;
      if (scheduleData) {
        schedule = scheduleData;
      } else {
        const dayOfWeek = format(parseISO(selectedDate), 'EEEE');
        const { data: weeklyData, error: weeklyError } = await supabase
          .from('schedules')
          .select('*')
          .eq('staff_id', selectedDoctor)
          .eq('is_weekly', true)
          .eq('day_of_week', dayOfWeek)
          .single();

        if (weeklyError && !weeklyError.message.includes('no rows')) throw weeklyError;
        schedule = weeklyData;
      }

      if (schedule) {
        const { data: timeSlots, error: timeSlotsError } = await supabase
          .from('time_slots')
          .select('*')
          .eq('schedule_id', schedule.schedule_id)
          .eq('status', 'available');

        if (timeSlotsError) throw timeSlotsError;

        setAvailableTimeSlots(timeSlots || []);
      } else {
        setAvailableTimeSlots([]);
      }
    } catch (error) {
      console.error('Error fetching time slots:', error);
      setError('Failed to load available time slots');
    }
  };

  const handleBookAppointment = async () => {
    if (!selectedTimeSlot || !selectedDoctor) return;

    try {
      setIsLoading(true);
      setError('');

      let appointmentPatientId;
      if (userRole === 'patient') {
        if (!patientId) {
          throw new Error('Patient information not found');
        }
        appointmentPatientId = patientId;
      } else {
        if (!selectedPatient) {
          throw new Error('Please select a patient');
        }
        appointmentPatientId = selectedPatient;
      }

      const { error: timeSlotError } = await supabase
        .from('time_slots')
        .update({ status: 'booked' })
        .eq('time_slot_id', selectedTimeSlot.time_slot_id);

      if (timeSlotError) throw timeSlotError;

      const { error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          patient_id: appointmentPatientId,
          staff_id: selectedDoctor,
          time_slot_id: selectedTimeSlot.time_slot_id,
          status: 'confirmed'
        });

      if (appointmentError) throw appointmentError;

      setIsBookingModalOpen(false);
      fetchAppointments();
    } catch (error) {
      console.error('Error booking appointment:', error);
      setError('Failed to book appointment: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId: number) => {
    try {
      setIsLoading(true);
      
      const { data: appointmentData } = await supabase
        .from('appointments')
        .select('time_slot_id')
        .eq('appointment_id', appointmentId)
        .single();

      if (!appointmentData) {
        throw new Error('Appointment not found');
      }

      const { error: appointmentError } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('appointment_id', appointmentId);

      if (appointmentError) throw appointmentError;

      const { error: timeSlotError } = await supabase
        .from('time_slots')
        .update({ status: 'available' })
        .eq('time_slot_id', appointmentData.time_slot_id);

      if (timeSlotError) throw timeSlotError;

      fetchAppointments();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      setError('Failed to cancel appointment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

  const createGoogleCalendarEvent = (appointment: Appointment) => {
    const startTime = new Date(appointment.start_time);
    const endTime = new Date(appointment.end_time);
    
    const event = {
      text: `Medical Appointment with ${appointment.doctor_name}`,
      dates: `${startTime.toISOString()}/${endTime.toISOString()}`,
      details: `Medical appointment at SmartMed Systems\nDoctor: ${appointment.doctor_name}\nStatus: ${appointment.status}`
    };

    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.text)}&dates=${encodeURIComponent(event.dates.replace(/[-:]/g, ''))}&details=${encodeURIComponent(event.details)}`;
    
    window.open(googleCalendarUrl, '_blank');
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
          return isBefore(appointmentDate, now) || appointment.status === 'cancelled';
        default:
          return false;
      }
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
        {(userRole === 'patient' || userRole === 'staff') && (
          <button
            onClick={() => setIsBookingModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Book Appointment
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Appointments</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {filterAppointments('upcoming').map(appointment => (
              <div
                key={appointment.appointment_id}
                className="p-4 border-b last:border-b-0 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-gray-900">{appointment.doctor_name}</p>
                  <p className="text-gray-600">
                    {format(parseISO(appointment.start_time), 'PPP')} at{' '}
                    {format(parseISO(appointment.start_time), 'p')}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleShowDetails(appointment)}
                    className="px-3 py-1 text-gray-600 border border-gray-600 rounded hover:bg-gray-50 flex items-center"
                  >
                    <Info className="w-4 h-4 mr-1" />
                    Details
                  </button>
                  <button
                    onClick={() => createGoogleCalendarEvent(appointment)}
                    className="px-3 py-1 text-green-600 border border-green-600 rounded hover:bg-green-50 flex items-center"
                  >
                    <Calendar className="w-4 h-4 mr-1" />
                    Add to Calendar
                  </button>
                  <button
                    onClick={() => {/* Handle reschedule */}}
                    className="px-3 py-1 text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
                  >
                    Reschedule
                  </button>
                  <button
                    onClick={() => handleCancelAppointment(appointment.appointment_id)}
                    className="px-3 py-1 text-red-600 border border-red-600 rounded hover:bg-red-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Pending Appointments</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {filterAppointments('pending').map(appointment => (
              <div
                key={appointment.appointment_id}
                className="p-4 border-b last:border-b-0 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-gray-900">{appointment.doctor_name}</p>
                  <p className="text-gray-600">
                    {format(parseISO(appointment.start_time), 'PPP')} at{' '}
                    {format(parseISO(appointment.start_time), 'p')}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleCancelAppointment(appointment.appointment_id)}
                    className="px-3 py-1 text-red-600 border border-red-600 rounded hover:bg-red-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Past Appointments</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {filterAppointments('past').map(appointment => (
              <div
                key={appointment.appointment_id}
                className="p-4 border-b last:border-b-0"
              >
                <p className="font-medium text-gray-900">{appointment.doctor_name}</p>
                <p className="text-gray-600">
                  {format(parseISO(appointment.start_time), 'PPP')} at{' '}
                  {format(parseISO(appointment.start_time), 'p')}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Status: {appointment.status}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <Dialog
        open={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        className="fixed inset-0 z-10 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

          <div className="relative bg-white rounded-lg max-w-md w-full mx-4 p-6">
            <div className="absolute top-4 right-4">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {selectedAppointment && (
              <div>
                <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">
                  Appointment Details
                </Dialog.Title>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Doctor</h3>
                    <p className="mt-1 text-sm text-gray-900">{selectedAppointment.doctor_name}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Date & Time</h3>
                    <p className="mt-1 text-sm text-gray-900">
                      {format(parseISO(selectedAppointment.start_time), 'PPP')}
                    </p>
                    <p className="text-sm text-gray-900">
                      {format(parseISO(selectedAppointment.start_time), 'p')} - {format(parseISO(selectedAppointment.end_time), 'p')}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Status</h3>
                    <p className="mt-1 text-sm text-gray-900 capitalize">{selectedAppointment.status}</p>
                  </div>

                  <div className="pt-4 flex justify-end space-x-3">
                    <button
                      onClick={() => createGoogleCalendarEvent(selectedAppointment)}
                      className="flex items-center px-4 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-md hover:bg-green-100"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Add to Google Calendar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Dialog>

      <Dialog
        open={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        className="fixed inset-0 z-10 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

          <div className="relative bg-white rounded-lg max-w-md w-full mx-4 p-6">
            <div className="absolute top-4 right-4">
              <button
                onClick={() => setIsBookingModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">
              Book an Appointment
            </Dialog.Title>

            <div className="space-y-4">
              {userRole === 'staff' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Patient
                  </label>
                  <select
                    value={selectedPatient}
                    onChange={(e) => setSelectedPatient(e.target.value)}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Choose a patient</option>
                    {patients.map(patient => (
                      <option key={patient.patient_id} value={patient.patient_id}>
                        {patient.first_name} {patient.last_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Doctor
                </label>
                <select
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Choose a doctor</option>
                  {doctors.map(doctor => (
                    <option key={doctor.staff_id} value={doctor.staff_id}>
                      Dr. {doctor.users.first_name} {doctor.users.last_name} - {doctor.specialization}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    fetchAvailableTimeSlots();
                  }}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {availableTimeSlots.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Available Time Slots
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {availableTimeSlots.map(slot => (
                      <button
                        key={slot.time_slot_id}
                        onClick={() => setSelectedTimeSlot(slot)}
                        className={`p-2 text-sm rounded-md ${
                          selectedTimeSlot?.time_slot_id === slot.time_slot_id
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                        }`}
                      >
                        {format(parseISO(slot.start_time), 'p')}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleBookAppointment}
                disabled={!selectedTimeSlot || isLoading || (userRole === 'staff' && !selectedPatient)}
                className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Booking...' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default Appointments;