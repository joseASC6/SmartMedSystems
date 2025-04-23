import React, { useState, Suspense } from 'react';
import { Heart, Activity, Users, Clock, ArrowRight } from 'lucide-react';
import { AuthProvider } from './contexts/AuthContext';
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import RoleSelection from './pages/RoleSelection';

// Lazy load the dashboards for better performance
const PatientHome = React.lazy(() => import('./pages/patient/Home.tsx'));
const ProviderDashboard = React.lazy(() => import('./pages/provider/Dashboard.tsx'));

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [userRole, setUserRole] = useState<'patient' | 'provider' | null>(null);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  const handleRoleSelect = (role: 'patient' | 'provider') => {
    setUserRole(role);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return <Login onNavigate={handleNavigate} />;
      case 'signup':
        return <Signup onNavigate={handleNavigate} onSignupSuccess={() => handleNavigate('role-selection')} />;
      case 'role-selection':
        return <RoleSelection onNavigate={handleNavigate} onRoleSelect={handleRoleSelect} />;
      case 'patient-home':
        return (
          <ProtectedRoute requiredRole="patient" onNavigate={handleNavigate}>
            <Suspense fallback={<div>Loading...</div>}>
              <PatientHome />
            </Suspense>
          </ProtectedRoute>
        );
      case 'provider-dashboard':
        return (
          <ProtectedRoute requiredRole="provider" onNavigate={handleNavigate}>
            <Suspense fallback={<div>Loading...</div>}>
              <ProviderDashboard />
            </Suspense>
          </ProtectedRoute>
        );
      default:
        return (
          <>
            {/* Hero Section */}
            <div className="relative bg-white overflow-hidden">
              <div className="max-w-7xl mx-auto">
                <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
                  <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                    <div className="sm:text-center lg:text-left">
                      <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                        <span className="block">Your Health Care</span>
                        <span className="block text-blue-600">Made Simple</span>
                      </h1>
                      <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                        Take control of your health with our comprehensive healthcare platform. Book appointments, track your health metrics, and connect with top healthcare professionals.
                      </p>
                      <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                        <div className="rounded-md shadow">
                          <button
                            onClick={() => handleNavigate('signup')}
                            className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
                          >
                            Get Started
                          </button>
                        </div>
                        <div className="mt-3 sm:mt-0 sm:ml-3">
                          <button
                            onClick={() => handleNavigate('login')}
                            className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200 md:py-4 md:text-lg md:px-10"
                          >
                            Log In
                          </button>
                        </div>
                      </div>
                    </div>
                  </main>
                </div>
              </div>
              <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
                <img className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full" src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" alt="Healthcare professionals" />
              </div>
            </div>

            {/* Features Section */}
            <div className="py-12 bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="lg:text-center">
                  <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Features</h2>
                  <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                    Everything you need in one place
                  </p>
                </div>

                <div className="mt-10">
                  <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="flex flex-col items-center">
                      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                        <Heart className="h-6 w-6" />
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
</svg>

                      </div>
                      <h3 className="mt-4 text-lg font-medium text-gray-900">Appointment Scheduling</h3>
                      <p className="mt-2 text-base text-gray-500 text-center">
                        Effortlessly schedule your next online appointment with on of our trusted medical professionals amd sign up ofr notifications
                      </p>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                        //<Users className="h-6 w-6" />
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
</svg>

                      </div>
                      <h3 className="mt-4 text-lg font-medium text-gray-900">Live Chat</h3>
                      <p className="mt-2 text-base text-gray-500 text-center">
                        Ask common health-related questions via live chat 
                      </p>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                        <Clock className="h-6 w-6" />
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
</svg>

                      </div>
                      <h3 className="mt-4 text-lg font-medium text-gray-900">Video Call</h3>
                      <p className="mt-2 text-base text-gray-500 text-center">
                      join video calls with my provider so that I can attend appointments remotely
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="bg-blue-600">
              <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
                <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                  <span className="block">Ready to get started?</span>
                  <span className="block text-blue-200">Sign up today!</span>
                </h2>
                <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
                  <div className="inline-flex rounded-md shadow">
                    <button
                      onClick={() => handleNavigate('signup')}
                      className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50"
                    >
                      Get Started
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Navigation onNavigate={handleNavigate} />
        {renderPage()}
      </div>
    </AuthProvider>
  );
}

export default App;