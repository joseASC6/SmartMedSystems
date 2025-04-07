import React, { useState } from 'react';
import { Menu, X, Activity } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NavigationProps {
  onNavigate: (page: string) => void;
}

function Navigation({ onNavigate }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, userRole, logout } = useAuth();

  const handleNavigate = (page: string) => {
    onNavigate(page);
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    handleNavigate('home');
  };

  const renderAuthenticatedNav = () => {
    if (userRole === 'patient') {
      return (
        <>
          <button onClick={() => handleNavigate('patient-home')} className="text-gray-700 hover:text-blue-600">Home</button>
          <button onClick={() => handleNavigate('appointments')} className="text-gray-700 hover:text-blue-600">Appointments</button>
          <button onClick={() => handleNavigate('chat')} className="text-gray-700 hover:text-blue-600">Chat</button>
          <button onClick={() => handleNavigate('profile')} className="text-gray-700 hover:text-blue-600">Profile</button>
        </>
      );
    }

    return (
      <>
        <button onClick={() => handleNavigate('provider-dashboard')} className="text-gray-700 hover:text-blue-600">Dashboard</button>
        <button onClick={() => handleNavigate('patients')} className="text-gray-700 hover:text-blue-600">Patients</button>
        <button onClick={() => handleNavigate('schedule')} className="text-gray-700 hover:text-blue-600">Schedule</button>
        <button onClick={() => handleNavigate('profile')} className="text-gray-700 hover:text-blue-600">Profile</button>
      </>
    );
  };

  const renderAuthButtons = () => {
    if (isAuthenticated) {
      return (
        <button
          onClick={handleLogout}
          className="bg-gray-100 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-200"
        >
          Log Out
        </button>
      );
    }

    return (
      <>
        <button
          onClick={() => handleNavigate('login')}
          className="bg-gray-100 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-200"
        >
          Log In
        </button>
        <button
          onClick={() => handleNavigate('signup')}
          className="bg-blue-600 px-4 py-2 rounded-lg text-white hover:bg-blue-700"
        >
          Sign Up
        </button>
      </>
    );
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">SmartMed Systems</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            {!isAuthenticated && (
              <>
                <button onClick={() => handleNavigate('home')} className="text-gray-700 hover:text-blue-600">Home</button>
                <button onClick={() => handleNavigate('about')} className="text-gray-700 hover:text-blue-600">About Us</button>
                <button onClick={() => handleNavigate('how-it-works')} className="text-gray-700 hover:text-blue-600">How It Works</button>
              </>
            )}
            {isAuthenticated && renderAuthenticatedNav()}
            {renderAuthButtons()}
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-500">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {!isAuthenticated ? (
              <>
                <button onClick={() => handleNavigate('home')} className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">Home</button>
                <button onClick={() => handleNavigate('about')} className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">About Us</button>
                <button onClick={() => handleNavigate('how-it-works')} className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">How It Works</button>
                <button
                  onClick={() => handleNavigate('login')}
                  className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  Log In
                </button>
                <button
                  onClick={() => handleNavigate('signup')}
                  className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  Sign Up
                </button>
              </>
            ) : (
              <>
                {userRole === 'patient' ? (
                  <>
                    <button onClick={() => handleNavigate('patient-home')} className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">Home</button>
                    <button onClick={() => handleNavigate('appointments')} className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">Appointments</button>
                    <button onClick={() => handleNavigate('chat')} className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">Chat</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleNavigate('provider-dashboard')} className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">Dashboard</button>
                    <button onClick={() => handleNavigate('patients')} className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">Patients</button>
                    <button onClick={() => handleNavigate('schedule')} className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">Schedule</button>
                  </>
                )}
                <button onClick={() => handleNavigate('profile')} className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">Profile</button>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  Log Out
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navigation;