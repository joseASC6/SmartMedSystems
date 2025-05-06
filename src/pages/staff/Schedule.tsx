import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, List, Plus, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface TimeSlot {
  start: string;
  end: string;
}

interface DaySchedule {
  date: string;
  timeSlots: TimeSlot[];
}

const Schedule: React.FC = () => {
  const { user } = useAuth();
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [schedules, setSchedules] = useState<DaySchedule[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<DaySchedule>({ date: '', timeSlots: [{ start: '', end: '' }] });
  const [slotDuration, setSlotDuration] = useState<'30' | '60' | 'custom'>('30');
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

      const { data: scheduleData, error: scheduleError } = await supabase
        .from('schedules')
        .select(`
          schedule_id,
          start_time,
          end_time
        `)
        .eq('staff_id', staffData.staff_id)
        .order('start_time');

      if (scheduleError) throw scheduleError;

      // Group schedules by date
      const groupedSchedules: DaySchedule[] = [];
      scheduleData?.forEach(schedule => {
        const date = new Date(schedule.start_time).toISOString().split('T')[0];
        const existingDay = groupedSchedules.find(day => day.date === date);
        
        if (existingDay) {
          existingDay.timeSlots.push({
            start: new Date(schedule.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            end: new Date(schedule.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });
        } else {
          groupedSchedules.push({
            date,
            timeSlots: [{
              start: new Date(schedule.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              end: new Date(schedule.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]
          });
        }
      });

      setSchedules(groupedSchedules);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      setError('Failed to load schedules');
    }
  };

  const handleAddTimeSlot = () => {
    setEditingSchedule(prev => ({
      ...prev,
      timeSlots: [...prev.timeSlots, { start: '', end: '' }]
    }));
  };

  const handleRemoveTimeSlot = (index: number) => {
    setEditingSchedule(prev => ({
      ...prev,
      timeSlots: prev.timeSlots.filter((_, i) => i !== index)
    }));
  };

  const handleTimeSlotChange = (index: number, field: 'start' | 'end', value: string) => {
    setEditingSchedule(prev => ({
      ...prev,
      timeSlots: prev.timeSlots.map((slot, i) => 
        i === index ? { ...slot, [field]: value } : slot
      )
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

      // Create schedule entries
      const schedulePromises = editingSchedule.timeSlots.map(slot => {
        const startDateTime = `${editingSchedule.date}T${slot.start}`;
        const endDateTime = `${editingSchedule.date}T${slot.end}`;

        return supabase
          .from('schedules')
          .insert({
            staff_id: staffData.staff_id,
            start_time: startDateTime,
            end_time: endDateTime
          });
      });

      await Promise.all(schedulePromises);

      // Create time slots based on duration
      const duration = parseInt(slotDuration);
      const timeSlotPromises = editingSchedule.timeSlots.flatMap(slot => {
        const slots = [];
        const start = new Date(`${editingSchedule.date}T${slot.start}`);
        const end = new Date(`${editingSchedule.date}T${slot.end}`);

        while (start < end) {
          const slotEnd = new Date(start.getTime() + duration * 60000);
          if (slotEnd > end) break;

          slots.push(
            supabase
              .from('time_slots')
              .insert({
                schedule_id: staffData.staff_id,
                start_time: start.toISOString(),
                end_time: slotEnd.toISOString(),
                status: 'available'
              })
          );

          start.setTime(start.getTime() + duration * 60000);
        }

        return slots;
      });

      await Promise.all(timeSlotPromises);

      setIsEditing(false);
      fetchSchedules();
    } catch (error) {
      console.error('Error saving schedule:', error);
      setError('Failed to save schedule');
    }
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

      {isEditing ? (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingSchedule.date ? `Edit Schedule for ${editingSchedule.date}` : 'Create New Schedule'}
          </h2>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              value={editingSchedule.date}
              onChange={(e) => setEditingSchedule(prev => ({ ...prev, date: e.target.value }))}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Slot Duration
            </label>
            <select
              value={slotDuration}
              onChange={(e) => setSlotDuration(e.target.value as '30' | '60' | 'custom')}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          {editingSchedule.timeSlots.map((slot, index) => (
            <div key={index} className="flex items-center space-x-4 mb-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  value={slot.start}
                  onChange={(e) => handleTimeSlotChange(index, 'start', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  value={slot.end}
                  onChange={(e) => handleTimeSlotChange(index, 'end', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                onClick={() => handleRemoveTimeSlot(index)}
                className="mt-8 p-2 text-red-600 hover:text-red-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}

          <button
            onClick={handleAddTimeSlot}
            className="mb-6 flex items-center text-blue-600 hover:text-blue-800"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Time Slot
          </button>

          <div className="flex justify-end space-x-4">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveSchedule}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save Schedule
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          {view === 'list' ? (
            <div className="p-6">
              <button
                onClick={() => {
                  setEditingSchedule({ date: '', timeSlots: [{ start: '', end: '' }] });
                  setIsEditing(true);
                }}
                className="mb-6 flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create New Schedule
              </button>

              {schedules.map((schedule, index) => (
                <div key={index} className="mb-6 last:mb-0">
                  <h3 className="text-lg font-semibold mb-2">{schedule.date}</h3>
                  <div className="space-y-2">
                    {schedule.timeSlots.map((slot, slotIndex) => (
                      <div key={slotIndex} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                        <span>{slot.start} - {slot.end}</span>
                        <button
                          onClick={() => {
                            setEditingSchedule(schedule);
                            setIsEditing(true);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6">
              {/* Calendar view implementation */}
              <div className="text-center text-gray-500">
                Calendar view coming soon...
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Schedule;