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
                      </div>
                      <h3 className="mt-4 text-lg font-medium text-gray-900">Health Monitoring</h3>
                      <p className="mt-2 text-base text-gray-500 text-center">
                        Track your vital signs and health metrics in real-time with our advanced monitoring system.
                      </p>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                        <Users className="h-6 w-6" />
                      </div>
                      <h3 className="mt-4 text-lg font-medium text-gray-900">Virtual Nursing Assistant</h3>
                      <p className="mt-2 text-base text-gray-500 text-center">
                        Connect with qualified healthcare professionals for consultations and treatment.aa
                      </p>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                        <Clock className="h-6 w-6" />
                      </div>
                      <h3 className="mt-4 text-lg font-medium text-gray-900">24/7 Support</h3>
                      <p className="mt-2 text-base text-gray-500 text-center">
                        Access healthcare support and emergency services around the clock.
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