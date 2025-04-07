import React from 'react';
import { Activity, Calendar, FileText, MessageSquare } from 'lucide-react';

const PatientHome = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Welcome Back!</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Upcoming Appointments */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <Calendar className="h-6 w-6 text-blue-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-800">Appointments</h2>
          </div>
          <p className="text-gray-600">Next appointment:</p>
          <p className="text-gray-900 font-medium">No upcoming appointments</p>
          <button className="mt-4 text-blue-600 hover:text-blue-700 font-medium flex items-center">
            Schedule Now
          </button>
        </div>

        {/* Health Metrics */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <Activity className="h-6 w-6 text-blue-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-800">Health Metrics</h2>
          </div>
          <div className="space-y-2">
            <p className="text-gray-600">Blood Pressure: <span className="text-gray-900">120/80</span></p>
            <p className="text-gray-600">Heart Rate: <span className="text-gray-900">72 bpm</span></p>
            <p className="text-gray-600">Weight: <span className="text-gray-900">150 lbs</span></p>
          </div>
        </div>

        {/* Medical Records */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <FileText className="h-6 w-6 text-blue-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-800">Records</h2>
          </div>
          <p className="text-gray-600 mb-2">Recent Documents:</p>
          <ul className="space-y-1">
            <li className="text-gray-900">Lab Results</li>
            <li className="text-gray-900">Prescription History</li>
            <li className="text-gray-900">Immunization Record</li>
          </ul>
        </div>

        {/* Messages */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <MessageSquare className="h-6 w-6 text-blue-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-800">Messages</h2>
          </div>
          <p className="text-gray-600">No unread messages</p>
          <button className="mt-4 text-blue-600 hover:text-blue-700 font-medium flex items-center">
            Contact Provider
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientHome;