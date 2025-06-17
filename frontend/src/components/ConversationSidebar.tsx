import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Plus, MessageSquare, Trash2, Bot, User, Clock, Search, Filter } from 'lucide-react';

interface Conversation {
  id: number;
  room_name: string;
  last_message_at: string;
  last_message?: string;
  ai_model: string;
  type: string;
  aiEnabled: boolean;
}

interface HistoryViewProps {
  conversations: Conversation[];
  currentConversationId: number | null;
  onCreateNew: () => void;
  onSwitchConversation: (id: number) => void;
  onDeleteConversation: (id: number) => void;
  onTabChange?: (tab: string) => void; // New prop to handle tab switching
}

const HistoryView: React.FC<HistoryViewProps> = ({
  conversations,
  currentConversationId,
  onCreateNew,
  onSwitchConversation,
  onDeleteConversation,
  onTabChange
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterModel, setFilterModel] = React.useState<string>('all');

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

  const handleConversationClick = (conversationId: number) => {
    onSwitchConversation(conversationId);
    onTabChange('chat'); // Switch to chat tab after selecting conversation
  };

  // Filter conversations based on search and model filter
  const filteredConversations = conversations.filter(conversation => {
    const matchesSearch = conversation.room_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         conversation.last_message?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         conversation.ai_model.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesModel = filterModel === 'all' || conversation.ai_model === filterModel;
    
    return matchesSearch && matchesModel;
  });

  // Get unique models for filter
  const uniqueModels = [...new Set(conversations.map(c => c.ai_model))];

  // Group conversations by date
  const groupedConversations = filteredConversations.reduce((groups, conversation) => {
    const date = new Date(conversation.last_message_at);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    let groupKey;
    if (date.toDateString() === today.toDateString()) {
      groupKey = 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      groupKey = 'Yesterday';
    } else if (date > new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)) {
      groupKey = 'This Week';
    } else {
      groupKey = 'Older';
    }
    
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(conversation);
    return groups;
  }, {} as Record<string, Conversation[]>);

  return (
    <div className="h-full bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 overflow-hidden">
      {/* Header */}
      <motion.div 
        className="p-6 border-b border-zinc-700/50 bg-zinc-800/50 backdrop-blur-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 rounded-lg">
              <MessageSquare className="w-5 h-5 text-neon-blue" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Conversation History</h2>
              <p className="text-sm text-zinc-400">
                {conversations.length} conversation{conversations.length !== 1 ? 's' : ''} • {filteredConversations.length} shown
              </p>
            </div>
          </div>

          {/* New Chat Button */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              onClick={() => {
                onCreateNew();
                onTabChange('chat');
              }}
              className="flex items-center gap-3 bg-gradient-to-r from-neon-blue to-neon-purple hover:from-neon-blue/80 hover:to-neon-purple/80 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl py-2.5 px-6"
            >
              <Plus size={16} />
              <span className="font-medium">New Chat</span>
            </Button>
          </motion.div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-700/50 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-neon-blue/50 focus:ring-1 focus:ring-neon-blue/20"
            />
          </div>

          {/* Model Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-zinc-400" />
            <select
              value={filterModel}
              onChange={(e) => setFilterModel(e.target.value)}
              className="bg-zinc-700/50 border border-zinc-600 rounded-lg text-white text-sm px-3 py-2 focus:outline-none focus:border-neon-blue/50"
            >
              <option value="all">All Models</option>
              {uniqueModels.map(model => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-6">
        {Object.keys(groupedConversations).length === 0 ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center h-64 text-center"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-zinc-700 to-zinc-800 rounded-2xl flex items-center justify-center mb-4">
              <MessageSquare size={24} className="text-zinc-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">
              {searchQuery || filterModel !== 'all' ? 'No matching conversations' : 'No conversations yet'}
            </h3>
            <p className="text-sm text-zinc-400 mb-4">
              {searchQuery || filterModel !== 'all' ? 'Try adjusting your search or filter' : 'Start a new chat to begin'}
            </p>
            <Button
              onClick={() => {
                onCreateNew();
                onTabChange('chat');
              }}
              className="bg-gradient-to-r from-neon-blue to-neon-purple hover:from-neon-blue/80 hover:to-neon-purple/80 text-white"
            >
              <Plus size={16} className="mr-2" />
              Start New Chat
            </Button>
          </motion.div>
        ) : (
          /* Grouped Conversations */
          <div className="space-y-8">
            {Object.entries(groupedConversations).map(([group, groupConversations]) => (
              <div key={group}>
                <h3 className="text-sm font-semibold text-zinc-400 mb-4 uppercase tracking-wider">
                  {group}
                </h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <AnimatePresence>
                    {groupConversations.map((conversation, index) => (
                      <motion.div
                        key={conversation.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
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
                        className={`relative rounded-xl cursor-pointer group transition-all duration-300 p-4 border ${
                          currentConversationId === conversation.id 
                            ? 'bg-gradient-to-r from-neon-blue/10 to-neon-purple/10 border-neon-blue shadow-lg shadow-neon-blue/20' 
                            : 'bg-zinc-800/60 border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800/80 hover:shadow-lg'
                        }`}
                        onClick={() => handleConversationClick(conversation.id)}
                      >
                        {/* Active indicator */}
                        {currentConversationId === conversation.id && (
                          <motion.div
                            layoutId="activeHistoryIndicator"
                            className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-neon-blue to-neon-purple rounded-t-xl"
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          />
                        )}

                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className={`p-2 rounded-lg ${
                              conversation.aiEnabled 
                                ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20' 
                                : 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20'
                            }`}>
                              {conversation.aiEnabled ? (
                                <Bot size={16} className="text-green-400" />
                              ) : (
                                <User size={16} className="text-blue-400" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-semibold text-white truncate">
                                {conversation.room_name}
                              </h4>
                              <span className="text-xs text-neon-blue font-medium">
                                {conversation.ai_model}
                              </span>
                            </div>
                          </div>

                          {/* Delete Button */}
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 0, scale: 1 }}
                            whileHover={{ opacity: 1, scale: 1.1 }}
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
                              className="h-8 w-8 p-0 rounded-lg hover:bg-red-500/20 hover:text-red-400 transition-all duration-200"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </motion.div>
                        </div>

                        {/* Last Message */}
                        {conversation.last_message && (
                          <p className="text-sm text-zinc-300 line-clamp-2 mb-3 leading-relaxed">
                            {conversation.last_message}
                          </p>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1 text-zinc-400">
                            <Clock size={12} />
                            <span>{formatDate(conversation.last_message_at)}</span>
                          </div>
                          {conversation.type && (
                            <span className="px-2 py-1 bg-zinc-700/50 text-zinc-300 rounded-full">
                              {conversation.type}
                            </span>
                          )}
                        </div>

                        {/* Hover Effect */}
                        <motion.div
                          className="absolute inset-0 rounded-xl bg-gradient-to-r from-neon-blue/5 to-neon-purple/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryView;
