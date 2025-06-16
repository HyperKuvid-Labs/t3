// ConversationSidebar.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Plus, MessageSquare, Trash2, ChevronLeft, ChevronRight, Bot, User } from 'lucide-react';

interface Conversation {
  id: number;
  room_name: string;
  last_message_at: string;
  last_message?: string;
  ai_model: string;
  type: string;
  aiEnabled: boolean;
}

interface ConversationSidebarProps {
  conversations: Conversation[];
  currentConversationId: number | null;
  onCreateNew: () => void;
  onSwitchConversation: (id: number) => void;
  onDeleteConversation: (id: number) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const ConversationSidebar: React.FC<ConversationSidebarProps> = ({
  conversations,
  currentConversationId,
  onCreateNew,
  onSwitchConversation,
  onDeleteConversation,
  isCollapsed,
  onToggleCollapse
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const sidebarVariants = {
    expanded: { width: 320 },
    collapsed: { width: 64 }
  };

  const contentVariants = {
    expanded: { opacity: 1, x: 0 },
    collapsed: { opacity: 0, x: -20 }
  };

  return (
    <motion.div
      initial={false}
      animate={isCollapsed ? "collapsed" : "expanded"}
      variants={sidebarVariants}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 border-r border-slate-200/60 dark:border-slate-700/60 flex flex-col relative backdrop-blur-sm"
    >
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/20 dark:from-blue-950/20 dark:via-transparent dark:to-purple-950/10 pointer-events-none" />
      
      {/* Collapse Toggle Button */}
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="absolute -right-3 top-6 z-20"
      >
        <Button 
          onClick={onToggleCollapse} 
          size="sm" 
          variant="outline" 
          className="w-7 h-7 rounded-full border-2 border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 shadow-lg backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-600"
        >
          <motion.div
            animate={{ rotate: isCollapsed ? 0 : 180 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronRight size={14} className="text-slate-600 dark:text-slate-300" />
          </motion.div>
        </Button>
      </motion.div>

      {/* Header Section */}
      <div className="p-4 border-b border-slate-200/60 dark:border-slate-700/60 relative z-10">
        <AnimatePresence mode="wait">
          {!isCollapsed ? (
            <motion.div
              key="expanded-header"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-3">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  Conversations
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {conversations.length} chat{conversations.length !== 1 ? 's' : ''}
                </p>
              </div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  onClick={onCreateNew}
                  className="w-full flex items-center gap-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl py-2.5"
                >
                  <Plus size={16} />
                  <span className="font-medium">New Chat</span>
                </Button>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="collapsed-header"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="flex justify-center"
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Button 
                  onClick={onCreateNew}
                  size="sm" 
                  className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Plus size={18} />
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent relative z-10">
        <div className="p-2 space-y-1">
          <AnimatePresence>
            {conversations.map((conversation, index) => (
              <motion.div 
                key={conversation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ 
                  duration: 0.3, 
                  delay: index * 0.05,
                  ease: [0.4, 0, 0.2, 1]
                }}
                whileHover={{ 
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.98 }}
                className={`relative rounded-xl cursor-pointer group transition-all duration-300 ${
                  currentConversationId === conversation.id 
                    ? 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30 shadow-md border border-blue-200/50 dark:border-blue-700/50' 
                    : 'hover:bg-white/60 dark:hover:bg-slate-800/60 hover:shadow-sm'
                }`}
                onClick={() => onSwitchConversation(conversation.id)}
              >
                {/* Active indicator */}
                {currentConversationId === conversation.id && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-r-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}

                <div className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`p-1.5 rounded-lg ${
                          conversation.aiEnabled 
                            ? 'bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30' 
                            : 'bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700'
                        }`}>
                          {conversation.aiEnabled ? (
                            <Bot size={12} className="text-purple-600 dark:text-purple-400" />
                          ) : (
                            <User size={12} className="text-slate-600 dark:text-slate-400" />
                          )}
                        </div>
                        
                        <AnimatePresence>
                          {!isCollapsed && (
                            <motion.div
                              variants={contentVariants}
                              initial="collapsed"
                              animate="expanded"
                              exit="collapsed"
                              transition={{ duration: 0.2 }}
                              className="flex-1 min-w-0"
                            >
                              <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                                {conversation.room_name}
                              </h4>
                              {conversation.ai_model && (
                                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                  {conversation.ai_model}
                                </span>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      
                      <AnimatePresence>
                        {!isCollapsed && conversation.last_message && (
                          <motion.p 
                            variants={contentVariants}
                            initial="collapsed"
                            animate="expanded"
                            exit="collapsed"
                            transition={{ duration: 0.2, delay: 0.05 }}
                            className="text-xs text-slate-600 dark:text-slate-400 truncate mb-2 leading-relaxed"
                          >
                            {conversation.last_message}
                          </motion.p>
                        )}
                      </AnimatePresence>
                      
                      <AnimatePresence>
                        {!isCollapsed && (
                          <motion.div
                            variants={contentVariants}
                            initial="collapsed"
                            animate="expanded"
                            exit="collapsed"
                            transition={{ duration: 0.2, delay: 0.1 }}
                            className="flex items-center justify-between"
                          >
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                              {formatDate(conversation.last_message_at)}
                            </span>
                            <div className="flex items-center gap-1">
                              {conversation.type && (
                                <span className="px-2 py-0.5 text-xs bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full">
                                  {conversation.type}
                                </span>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    
                    <AnimatePresence>
                      {!isCollapsed && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 0, scale: 1 }}
                          whileHover={{ opacity: 1, scale: 1.1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.2 }}
                          className="group-hover:opacity-100 transition-opacity duration-200"
                        >
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteConversation(conversation.id);
                            }}
                            className="h-7 w-7 p-0 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
                          >
                            <Trash2 size={12} />
                          </Button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        {/* Empty state */}
        {conversations.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center h-64 text-center p-6"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-2xl flex items-center justify-center mb-4">
              <MessageSquare size={24} className="text-slate-400 dark:text-slate-500" />
            </div>
            {!isCollapsed && (
              <>
                <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                  No conversations yet
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-500">
                  Start a new chat to begin
                </p>
              </>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default ConversationSidebar;
