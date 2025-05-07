import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, List, Plus, X, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { format, startOfWeek, addDays } from 'date-fns';

interface TimeSlot {
  start: string;
  end: string;
}

interface DaySchedule {
  date: string;
  timeSlots: TimeSlot[];
  duration: number;
}

interface WeeklySchedule {
  [key: string]: {
    isAvailable: boolean;
    timeSlots: TimeSlot[];
    duration: number;
  };
}

const generateTimeOptions = () => {
  const times = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const formattedHour = hour.toString().padStart(2, '0');
      const formattedMinute = minute.toString().padStart(2, '0');
      const time = `${formattedHour}:${formattedMinute}`;
      const label = format(new Date(2024, 0, 1, hour, minute), 'h:mm a');
      times.push({ value: time, label });
    }
  }
  return times;
};

const TIME_OPTIONS = generateTimeOptions();

const Schedule: React.FC = () => {
  const { user } = useAuth();
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule>({
    Sunday: { isAvailable: false, timeSlots: [], duration: 30 },
    Monday: { isAvailable: false, timeSlots: [], duration: 30 },
    Tuesday: { isAvailable: false, timeSlots: [], duration: 30 },
    Wednesday: { isAvailable: false, timeSlots: [], duration: 30 },
    Thursday: { isAvailable: false, timeSlots: [], duration: 30 },
    Friday: { isAvailable: false, timeSlots: [], duration: 30 },
    Saturday: { isAvailable: false, timeSlots: [], duration: 30 },
  });
  const [specificDates, setSpecificDates] = useState<DaySchedule[]>([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchSchedules();
    }
  }, [user]);

  const fetchSchedules = async () => {
    try {
      const { data: staffData, error: staffError } = await supabase
        .from('staff')
        .select('staff_id')
        .eq('user_id', user?.id)
        .single();

      if (staffError) throw staffError;

      const { data: weeklyData, error: weeklyError } = await supabase
        .from('schedules')
        .select('*')
        .eq('staff_id', staffData.staff_id)
        .eq('is_weekly', true);

      if (weeklyError) throw weeklyError;

      const { data: specificData, error: specificError } = await supabase
        .from('schedules')
        .select('*')
        .eq('staff_id', staffData.staff_id)
        .eq('is_weekly', false);

      if (specificError) throw specificError;

      // Process schedules...
    } catch (error) {
      console.error('Error fetching schedules:', error);
      setError('Failed to load schedules');
    }
  };

  const handleWeeklyAvailabilityToggle = (day: string) => {
    setWeeklySchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        isAvailable: !prev[day].isAvailable,
        timeSlots: !prev[day].isAvailable ? [{ start: '09:00', end: '17:00' }] : []
      }
    }));
  };

  const handleAddWeeklyTimeSlot = (day: string) => {
    setWeeklySchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        timeSlots: [...prev[day].timeSlots, { start: '09:00', end: '17:00' }]
      }
    }));
  };

  const handleWeeklyTimeSlotChange = (day: string, index: number, field: 'start' | 'end', value: string) => {
    setWeeklySchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        timeSlots: prev[day].timeSlots.map((slot, i) => 
          i === index ? { ...slot, [field]: value } : slot
        )
      }
    }));
  };

  const handleWeeklyDurationChange = (day: string, duration: number) => {
    setWeeklySchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        duration
      }
    }));
  };

  const handleRemoveWeeklyTimeSlot = (day: string, index: number) => {
    setWeeklySchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        timeSlots: prev[day].timeSlots.filter((_, i) => i !== index)
      }
    }));
  };

  const handleSaveSchedule = async () => {
    try {
      const { data: staffData, error: staffError } = await supabase
        .from('staff')
        .select('staff_id')
        .eq('user_id', user?.id)
        .single();

      if (staffError) throw staffError;

      for (const [day, schedule] of Object.entries(weeklySchedule)) {
        if (schedule.isAvailable) {
          for (const slot of schedule.timeSlots) {
            await supabase
              .from('schedules')
              .insert({
                staff_id: staffData.staff_id,
                is_weekly: true,
                day_of_week: day,
                start_time: slot.start,
                end_time: slot.end,
                slot_duration: schedule.duration
              });
          }
        }
      }

      fetchSchedules();
    } catch (error) {
      console.error('Error saving schedule:', error);
      setError('Failed to save schedule');
    }
  };

  const TimeSelect = ({ value, onChange, className = '' }: { 
    value: string; 
    onChange: (value: string) => void;
    className?: string;
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectedOption = TIME_OPTIONS.find(option => option.value === value);

    return (
      <div className="relative w-36">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${className}`}
        >
          <span className="truncate">{selectedOption?.label || 'Select time'}</span>
          <ChevronDown className="h-4 w-4 ml-2 text-gray-400" />
        </button>

        {isOpen && (
          <>
            <div 
              className="fixed inset-0" 
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
              {TIME_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  className={`w-full text-left px-3 py-2 hover:bg-blue-50 ${
                    value === option.value ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                  }`}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Schedule Management</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => setView('list')}
            className={`px-4 py-2 rounded-lg flex items-center ${
              view === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            <List className="w-5 h-5 mr-2" />
            List View
          </button>
          <button
            onClick={() => setView('calendar')}
            className={`px-4 py-2 rounded-lg flex items-center ${
              view === 'calendar' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            <CalendarIcon className="w-5 h-5 mr-2" />
            Calendar View
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      <div className="space-y-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Weekly Hours</h2>
          <p className="text-gray-600 mb-6">Set when you are typically available for meetings</p>

          {Object.entries(weeklySchedule).map(([day, schedule]) => (
            <div key={day} className="mb-6 border-b pb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={schedule.isAvailable}
                    onChange={() => handleWeeklyAvailabilityToggle(day)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-lg font-medium">{day}</span>
                </div>
                {schedule.isAvailable && (
                  <button
                    onClick={() => handleAddWeeklyTimeSlot(day)}
                    className="text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Time Slot
                  </button>
                )}
              </div>

              {schedule.isAvailable && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 mb-4">
                    <span className="text-sm font-medium text-gray-700">Default duration:</span>
                    <select
                      value={schedule.duration}
                      onChange={(e) => handleWeeklyDurationChange(day, parseInt(e.target.value))}
                      className="block w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={45}>45 minutes</option>
                      <option value={60}>1 hour</option>
                    </select>
                  </div>

                  {schedule.timeSlots.map((slot, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <TimeSelect
                        value={slot.start}
                        onChange={(value) => handleWeeklyTimeSlotChange(day, index, 'start', value)}
                      />
                      <span>to</span>
                      <TimeSelect
                        value={slot.end}
                        onChange={(value) => handleWeeklyTimeSlotChange(day, index, 'end', value)}
                      />
                      <button
                        onClick={() => handleRemoveWeeklyTimeSlot(day, index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Date-specific Hours</h2>
          <p className="text-gray-600 mb-6">Adjust hours for specific days</p>

          <button
            onClick={() => setShowCalendar(true)}
            className="mb-4 flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <CalendarIcon className="w-5 h-5 mr-2" />
            Select Dates
          </button>

          {showCalendar && (
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
              <div className="bg-white rounded-lg p-6 max-w-lg w-full">
                <h3 className="text-lg font-medium mb-4">Select Dates</h3>
                <div className="flex justify-end space-x-4 mt-4">
                  <button
                    onClick={() => setShowCalendar(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setShowCalendar(false);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}

          {selectedDates.map((date) => (
            <div key={date} className="mb-6 border-b pb-6">
              {/* Date-specific time slots UI */}
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSaveSchedule}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Save All Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default Schedule;