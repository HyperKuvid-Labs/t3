import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import Navigation from '@/components/Navigation';
import LandingPage from '@/components/LandingPage';
import ChatInterface from '@/components/ChatInterface';
import AIRoom from '@/components/AIRoom';
import ProjectBuilder from '@/components/ProjectBuilder';
import Login from '@/components/Login';
import Signup from '@/components/SignUp';
import Footer from '@/components/Footer';
import { toast } from '@/hooks/use-toast';
import GoogleCallback from '@/components/GoogleCallback';
import { Shield, Loader2, AlertCircle } from 'lucide-react';

interface User {
  id: string;
  username: string;
  email: string;
  authProvider: string;
}

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        // Verify token with backend
        const response = await fetch('https://ec2-16-16-146-220.eu-north-1.compute.amazonaws.com/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          // Token invalid, clear it
          localStorage.removeItem('authToken');
          localStorage.removeItem('tokenType');
          setIsAuthenticated(false);
          toast({
            title: "Session Expired",
            description: "Please sign in again to continue",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
        toast({
          title: "Connection Error",
          description: "Unable to verify authentication",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div
          className="text-center space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative">
            <Shield className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin absolute -top-2 -right-2" />
          </div>
          <h2 className="text-2xl font-bold text-white">Verifying Authentication</h2>
          <p className="text-gray-300">Please wait while we check your credentials...</p>
        </motion.div>
      </div>
    );
  }

  if (isAuthenticated === false) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Layout component for authenticated pages
const AuthenticatedLayout = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const location = useLocation();

  useEffect(() => {
    // Get user info on mount
    const getUserInfo = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) return;

        const response = await fetch('https://ec2-16-16-146-220.eu-north-1.compute.amazonaws.com/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error('Failed to get user info:', error);
      }
    };

    getUserInfo();
  }, []);

  const handleLogout = async () => {
    try {
      // Call backend logout
      await fetch('https://ec2-16-16-146-220.eu-north-1.compute.amazonaws.com/logout', {
        method: 'GET',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('tokenType');
      setUser(null);
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
      });
      // Redirect to home
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Enhanced Navigation with User Info */}
      <Navigation 
        currentView={location.pathname.substring(1) || 'home'} 
        onViewChange={() => {}} 
        user={user} 
        onLogout={handleLogout} 
      />

      {/* Page Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </AnimatePresence>

      {/* Authentication Status Indicator */}
      {user && (
        <div className="fixed bottom-4 right-4 bg-green-500/20 backdrop-blur-sm border border-green-500/30 rounded-lg px-3 py-2 text-sm text-green-300">
          Signed in as {user.username}
        </div>
      )}
    </div>
  );
};

// Main Index Component with Router
const Index = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Initialize app
    const initializeApp = async () => {
      try {
        // Check if backend is available
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const healthCheck = await fetch('https://ec2-16-16-146-220.eu-north-1.compute.amazonaws.com/health', {
          method: 'GET',
          signal: controller.signal
        }).catch(() => null);

        clearTimeout(timeoutId);

        if (!healthCheck || !healthCheck.ok) {
          setHasError(true);
          toast({
            title: "Backend Unavailable",
            description: "Please ensure the backend server is running on https://ec2-16-16-146-220.eu-north-1.compute.amazonaws.com",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('App initialization error:', error);
        setHasError(true);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeApp();
  }, []);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div
          className="text-center space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Loader2 className="w-16 h-16 text-purple-400 animate-spin mx-auto" />
          <h2 className="text-2xl font-bold text-white">Initializing Gideon</h2>
          <p className="text-gray-300">Setting up your AI workspace...</p>
        </motion.div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div
          className="text-center space-y-6 max-w-md mx-auto p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto" />
          <h2 className="text-2xl font-bold text-white">Connection Error</h2>
          <p className="text-gray-300">
            Unable to connect to the backend server. Please ensure it's running on https://ec2-16-16-146-220.eu-north-1.compute.amazonaws.com
          </p>
          <motion.button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-medium transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Retry Connection
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/auth/google/callback" element={<GoogleCallback />} />
        
        {/* Home Route - Public but shows different content based on auth */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Protected Routes with Layout */}
        <Route path="/chat" element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <ChatInterface />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/room" element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <AIRoom />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/builder" element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <ProjectBuilder />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default Index;
