
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { MessageSquare, Code, History, Sparkles } from 'lucide-react';

interface Tab {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcut: string;
}

const tabs: Tab[] = [
  { id: 'chat', label: 'Chat', icon: MessageSquare, shortcut: 'Ctrl+1' },
  { id: 'build', label: 'Build', icon: Code, shortcut: 'Ctrl+2' },
  { id: 'history', label: 'History', icon: History, shortcut: 'Ctrl+3' },
];

interface ChatTabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const ChatTabs = ({ activeTab, onTabChange }: ChatTabsProps) => {
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '1':
            e.preventDefault();
            onTabChange('chat');
            break;
          case '2':
            e.preventDefault();
            onTabChange('build');
            break;
          case '3':
            e.preventDefault();
            onTabChange('history');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onTabChange]);

  return (
    <div className="relative">
      {/* Tab Navigation */}
      <div className="flex items-center gap-2 p-2 bg-zinc-900/50 rounded-xl border border-zinc-800">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isHovered = hoveredTab === tab.id;

          return (
            <motion.div
              key={tab.id}
              className="relative"
              onMouseEnter={() => setHoveredTab(tab.id)}
              onMouseLeave={() => setHoveredTab(null)}
            >
              {/* Active tab indicator */}
              {isActive && (
                <motion.div
                  className="absolute inset-0 bg-zinc-800 rounded-lg border border-neon-blue/30"
                  layoutId="activeTab"
                  transition={{ duration: 0.15, ease: "easeOut" }}
                />
              )}

              <Button
                onClick={() => onTabChange(tab.id)}
                variant="ghost"
                size="sm"
                className={`relative z-10 h-10 px-4 font-medium tracking-tight transition-all duration-150 ease-out ${
                  isActive
                    ? 'text-white bg-transparent shadow-lg'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                }`}
              >
                <motion.div
                  className="flex items-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.div
                    animate={{
                      rotate: isActive ? [0, 5, -5, 0] : 0,
                      scale: isHovered || isActive ? 1.1 : 1,
                    }}
                    transition={{
                      rotate: { duration: 0.3, ease: "easeInOut" },
                      scale: { duration: 0.15 }
                    }}
                  >
                    <Icon className={`w-4 h-4 ${
                      isActive 
                        ? 'text-neon-blue' 
                        : isHovered 
                        ? 'text-neon-blue/70' 
                        : 'text-zinc-500'
                    }`} />
                  </motion.div>
                  <span>{tab.label}</span>
                  
                  {/* Keyboard shortcut hint */}
                  <motion.span
                    className="text-xs text-zinc-600 ml-1 hidden sm:inline"
                    animate={{ opacity: isHovered ? 1 : 0.6 }}
                  >
                    {tab.shortcut.replace('Ctrl', '⌘')}
                  </motion.span>
                </motion.div>

                {/* Ripple effect on click */}
                <motion.div
                  className="absolute inset-0 rounded-lg"
                  initial={{ scale: 0, opacity: 0.3 }}
                  whileTap={{ scale: 1.2, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    background: 'radial-gradient(circle, rgba(0, 191, 255, 0.3) 0%, transparent 70%)'
                  }}
                />
              </Button>

              {/* Hover underline indicator */}
              {!isActive && isHovered && (
                <motion.div
                  className="absolute bottom-0 left-1/2 w-8 h-0.5 bg-gradient-to-r from-neon-blue to-neon-purple rounded-full"
                  initial={{ width: 0, x: '-50%' }}
                  animate={{ width: 32, x: '-50%' }}
                  exit={{ width: 0, x: '-50%' }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </motion.div>
          );
        })}

        {/* Pro indicator */}
        <motion.div
          className="ml-auto flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-neon-purple/20 to-pink-500/20 border border-neon-purple/30 rounded-lg"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <Sparkles className="w-3 h-3 text-neon-purple" />
          <span className="text-xs font-medium text-neon-purple">Pro</span>
        </motion.div>
      </div>

      {/* Tab content indicators */}
      <motion.div
        className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-blue/30 to-transparent"
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
};

export default ChatTabs;
