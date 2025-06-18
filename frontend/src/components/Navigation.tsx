import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MessageSquare, Home, Code, Users, Menu, X, LogOut, User } from 'lucide-react';

interface User {
  id: string;
  username: string;
  email: string;
  authProvider: string;
}

export interface NavigationProps {
  currentView?: string; // Made optional since we'll get it from useLocation
  onViewChange?: (view: string) => void; // Made optional since we'll use navigate
  onLogout: () => void;
  user?: User | null;
}

const Navigation = ({ onLogout, user }: NavigationProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Get current route from location
  const currentView = location.pathname === '/' ? 'home' : location.pathname.substring(1);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home, path: '/' },
    { id: 'chat', label: 'Chat', icon: MessageSquare, path: '/chat' },
    { id: 'room', label: 'AI Room', icon: Users, path: '/room' },
    { id: 'builder', label: 'Project Builder', icon: Code, path: '/builder' }
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileOpen(false);
  };

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 mb-10 py-4${
        isScrolled
          ? 'bg-slate-900/95 backdrop-blur-md border-b border-slate-800/50'
          : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            className="flex-shrink-0 cursor-pointer"
            onClick={() => handleNavigation('/')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <h1 className="text-2xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
              Gideon
            </h1>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Button
                      onClick={() => handleNavigation(item.path)}
                      variant="ghost"
                      size="sm"
                      className={`relative px-6 py-3 rounded-xl font-medium transition-all duration-300 group ${
                        isActive
                          ? 'text-white bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 border border-neon-blue/30'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                      }`}
                    >
                      {/* Background glow effect */}
                      {isActive && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-neon-blue/10 to-neon-purple/10 rounded-xl blur-xl"
                          layoutId="activeTab"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}

                      <Icon className="w-4 h-4 mr-2" />
                      {item.label}

                      {/* Hover indicator */}
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-neon-blue to-neon-purple rounded-full"
                        initial={{ scaleX: 0 }}
                        whileHover={{ scaleX: isActive ? 1 : 0.8 }}
                        transition={{ duration: 0.3 }}
                      />
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* User Menu & Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            {/* User Info (Desktop) */}
            {user && (
              <div className="hidden md:flex items-center space-x-3">
                <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <User className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-300">{user.username}</span>
                </div>
                <Button
                  onClick={onLogout}
                  variant="ghost"
                  size="sm"
                  className="text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="md:hidden text-slate-400 hover:text-white"
              variant="ghost"
              size="sm"
            >
              {isMobileOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileOpen && (
            <motion.div
              className="md:hidden"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="px-2 pt-2 pb-3 space-y-1 bg-slate-900/95 backdrop-blur-md rounded-b-2xl border-b border-slate-800/50">
                {navItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Button
                        onClick={() => handleNavigation(item.path)}
                        variant="ghost"
                        className={`w-full justify-start px-4 py-3 rounded-xl transition-all duration-300 ${
                          isActive
                            ? 'text-white bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 border border-neon-blue/30'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                        }`}
                      >
                        <Icon className="w-5 h-5 mr-3" />
                        {item.label}
                      </Button>
                    </motion.div>
                  );
                })}

                {/* Mobile User Menu */}
                {user && (
                  <motion.div
                    className="pt-4 mt-4 border-t border-slate-700/50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                  >
                    <div className="flex items-center justify-between px-4 py-2 text-slate-300">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4" />
                        <span className="text-sm">{user.username}</span>
                      </div>
                      <Button
                        onClick={onLogout}
                        variant="ghost"
                        size="sm"
                        className="text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                      >
                        <LogOut className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navigation;
