import React from 'react';
import { Users, Clock, Calendar, BarChart as ChartBar } from 'lucide-react';

const ProviderDashboard = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Provider Dashboard</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          + New Appointment
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Total Patients</p>
              <h3 className="text-2xl font-bold text-gray-900">248</h3>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Today's Appointments</p>
              <h3 className="text-2xl font-bold text-gray-900">12</h3>
            </div>
            <Calendar className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Average Wait Time</p>
              <h3 className="text-2xl font-bold text-gray-900">14 min</h3>
            </div>
            <Clock className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Patient Satisfaction</p>
              <h3 className="text-2xl font-bold text-gray-900">94%</h3>
            </div>
            <ChartBar className="h-8 w-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Today's Schedule</h2>
        </div>
        <div className="divide-y divide-gray-200">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-900">Sarah Johnson</p>
                <p className="text-sm text-gray-600">General Checkup</p>
              </div>
              <div className="text-right">
                <p className="text-blue-600 font-medium">9:00 AM</p>
                <p className="text-sm text-gray-600">15 min</p>
              </div>
            </div>
          </div>
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-900">Michael Smith</p>
                <p className="text-sm text-gray-600">Follow-up</p>
              </div>
              <div className="text-right">
                <p className="text-blue-600 font-medium">10:30 AM</p>
                <p className="text-sm text-gray-600">30 min</p>
              </div>
            </div>
          </div>
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-900">Emily Davis</p>
                <p className="text-sm text-gray-600">Consultation</p>
              </div>
              <div className="text-right">
                <p className="text-blue-600 font-medium">2:15 PM</p>
                <p className="text-sm text-gray-600">45 min</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;