
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { MessageSquare, Home, Code, Users, Menu, X } from 'lucide-react';
import { User } from './types/user';

export interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
  onLogout: () => void;
  user?: User | null;
}

const Navigation = ({ currentView, onViewChange }: NavigationProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'room', label: 'AI Room', icon: Users },
    { id: 'builder', label: 'Project Builder', icon: Code }
  ];

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50 shadow-2xl shadow-neon-blue/5' 
          : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
            className="flex items-center gap-3"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center"
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.6 }}
            >
              <MessageSquare className="w-5 h-5 text-white" />
              <motion.div
                className="absolute inset-0 rounded-xl bg-gradient-to-br from-neon-blue to-neon-purple opacity-75"
                animate={{ 
                  boxShadow: [
                    '0 0 0 0 rgba(0, 191, 255, 0.4)',
                    '0 0 0 10px rgba(0, 191, 255, 0)',
                    '0 0 0 0 rgba(0, 191, 255, 0)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
            <motion.span
              className="text-2xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Gidvion
            </motion.span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Button
                    onClick={() => onViewChange(item.id)}
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
                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-neon-blue/10 to-neon-purple/10"
                        layoutId="activeTab"
                        transition={{ duration: 0.3 }}
                      />
                    )}
                    
                    <motion.div
                      className="flex items-center gap-2 relative z-10"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Icon className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-neon-blue' : 'text-slate-400 group-hover:text-neon-blue'
                      }`} />
                      <span>{item.label}</span>
                    </motion.div>

                    {/* Hover indicator */}
                    <motion.div
                      className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-neon-blue to-neon-purple rounded-full"
                      whileHover={{ width: '80%', x: '-50%' }}
                      transition={{ duration: 0.3 }}
                    />
                  </Button>
                </motion.div>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <motion.div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="text-slate-400 hover:text-white"
            >
              <AnimatePresence mode="wait">
                {isMobileOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90 }}
                    animate={{ rotate: 0 }}
                    exit={{ rotate: 90 }}
                  >
                    <X className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90 }}
                    animate={{ rotate: 0 }}
                    exit={{ rotate: -90 }}
                  >
                    <Menu className="w-5 h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </motion.div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileOpen && (
            <motion.div
              className="md:hidden mt-6 pb-6"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-2">
                {navItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      <Button
                        onClick={() => {
                          onViewChange(item.id);
                          setIsMobileOpen(false);
                        }}
                        variant="ghost"
                        className={`w-full justify-start px-4 py-3 rounded-xl transition-all duration-300 ${
                          isActive
                            ? 'text-white bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 border border-neon-blue/30'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                        }`}
                      >
                        <Icon className={`w-4 h-4 mr-3 ${
                          isActive ? 'text-neon-blue' : 'text-slate-400'
                        }`} />
                        {item.label}
                      </Button>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navigation;
