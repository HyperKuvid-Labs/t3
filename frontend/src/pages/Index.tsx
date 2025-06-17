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
        const response = await fetch('http://localhost:8000/auth/me', {
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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <div className="text-center">
            <h3 className="text-white font-medium mb-2">Verifying Authentication</h3>
            <p className="text-slate-400 text-sm">Please wait while we check your credentials...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (isAuthenticated === false) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Main App Component with Authentication
const AuthenticatedApp = () => {
  const [currentView, setCurrentView] = useState('home');
  const [user, setUser] = useState<User | null>(null);
  const location = useLocation();

  useEffect(() => {
    // Update current view based on route
    const path = location.pathname;
    if (path === '/chat') setCurrentView('chat');
    else if (path === '/room') setCurrentView('room');
    else if (path === '/builder') setCurrentView('builder');
    else setCurrentView('home');
  }, [location]);

  useEffect(() => {
    // Get user info on mount
    const getUserInfo = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) return;

        const response = await fetch('http://localhost:8000/auth/me', {
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
      await fetch('http://localhost:8000/logout', {
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

  const renderCurrentView = () => {
    switch (currentView) {
      case 'home':
        return <LandingPage />;
      case 'chat':
        return <ChatInterface />;
      case 'room':
        return <AIRoom />;
      case 'builder':
        return <ProjectBuilder />;
      default:
        return <LandingPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 flex flex-col">
      {/* Enhanced Navigation with User Info */}
      <Navigation 
        currentView={currentView} 
        onViewChange={setCurrentView}
        user={user}
        onLogout={handleLogout}
      />
      
      {/* Page Transition Container */}
      <div className={`flex-1 relative overflow-hidden ${currentView !== 'home' ? 'pt-16' : ''}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="h-full"
          >
            {renderCurrentView()}
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Footer with Authentication Status */}
      {currentView === 'home' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Footer/>
        </motion.div>
      )}
      
      {/* Authentication Status Indicator */}
      {user && (
        <motion.div
          className="fixed bottom-4 right-4 z-50"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1 }}
        >
          <div className="bg-slate-800/90 backdrop-blur-sm border border-slate-700/50 rounded-xl px-4 py-2 shadow-lg">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <Shield className="w-4 h-4 text-green-400" />
              <span className="text-slate-300">
                Signed in as <span className="text-white font-medium">{user.username}</span>
              </span>
            </div>
          </div>
        </motion.div>
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

        const healthCheck = await fetch('http://localhost:8000/health', {
          method: 'GET',
          signal: controller.signal
        }).catch(() => null);

        clearTimeout(timeoutId);

        if (!healthCheck || !healthCheck.ok) {
          setHasError(true);
          toast({
            title: "Backend Unavailable",
            description: "Please ensure the backend server is running on localhost:8000",
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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center gap-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="w-20 h-20 border-4 border-purple-500 border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Initializing Gideon</h2>
            <p className="text-slate-400">Setting up your AI workspace...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 flex items-center justify-center">
        <motion.div
          className="text-center max-w-md mx-auto p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Connection Error</h2>
          <p className="text-slate-400 mb-6">
            Unable to connect to the backend server. Please ensure it's running on localhost:8000
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
        
        {/* Protected Routes */}
        <Route path="/chat" element={
          <ProtectedRoute>
            <AuthenticatedApp />
          </ProtectedRoute>
        } />
        <Route path="/room" element={
          <ProtectedRoute>
            <AuthenticatedApp />
          </ProtectedRoute>
        } />
        <Route path="/builder" element={
          <ProtectedRoute>
            <AuthenticatedApp />
          </ProtectedRoute>
        } />

        <Route path="/auth/google" element={<GoogleCallback />} />
        
        {/* Home Route - Public but shows different content based on auth */}
        <Route path="/" element={<AuthenticatedApp />} />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default Index;
