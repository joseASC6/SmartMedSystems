import React, { useState } from 'react';
import { Menu, X, Activity } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, userRole, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const renderAuthenticatedNav = () => {
    if (userRole === 'patient') {
      return (
        <>
          <Link to="/patient-home" className="text-gray-700 hover:text-blue-600">Home</Link>
          <Link to="/appointments" className="text-gray-700 hover:text-blue-600">Appointments</Link>
          <Link to="/chat" className="text-gray-700 hover:text-blue-600">Chat</Link>
          <Link to="/profile" className="text-gray-700 hover:text-blue-600">Profile</Link>
        </>
      );
    }

    return (
      <>
        <Link to="/staff-dashboard" className="text-gray-700 hover:text-blue-600">Dashboard</Link>
        <Link to="/patients" className="text-gray-700 hover:text-blue-600">Patients</Link>
        <Link to="/schedule" className="text-gray-700 hover:text-blue-600">Schedule</Link>
        <Link to="/profile" className="text-gray-700 hover:text-blue-600">Profile</Link>
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
        <Link
          to="/login"
          className="bg-gray-100 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-200"
        >
          Log In
        </Link>
        <Link
          to="/signup"
          className="bg-blue-600 px-4 py-2 rounded-lg text-white hover:bg-blue-700"
        >
          Sign Up
        </Link>
      </>
    );
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Activity className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">SmartMed Systems</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            {!isAuthenticated && (
              <>
                <Link to="/" className="text-gray-700 hover:text-blue-600">Home</Link>
                <Link to="/about" className="text-gray-700 hover:text-blue-600">About Us</Link>
                <Link to="/how-it-works" className="text-gray-700 hover:text-blue-600">How It Works</Link>
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
                <Link to="/" className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">Home</Link>
                <Link to="/about" className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">About Us</Link>
                <Link to="/how-it-works" className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">How It Works</Link>
                <Link
                  to="/login"
                  className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                {userRole === 'patient' ? (
                  <>
                    <Link to="/patient-home" className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">Home</Link>
                    <Link to="/appointments" className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">Appointments</Link>
                    <Link to="/chat" className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">Chat</Link>
                  </>
                ) : (
                  <>
                    <Link to="/staff-dashboard" className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">Dashboard</Link>
                    <Link to="/patients" className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">Patients</Link>
                    <Link to="/schedule" className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">Schedule</Link>
                  </>
                )}
                <Link to="/profile" className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">Profile</Link>
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