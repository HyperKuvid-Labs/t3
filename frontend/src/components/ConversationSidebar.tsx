// ConversationSidebar.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Plus, MessageSquare, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

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
  return (
    <motion.div
      initial={false}
      animate={{ width: isCollapsed ? 60 : 280 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col relative"
    >
      {/* Collapse Toggle Button */}
      <Button 
        onClick={onToggleCollapse} 
        size="sm" 
        variant="ghost" 
        className="absolute -right-3 top-4 z-10 w-6 h-6 rounded-full border bg-white dark:bg-gray-800 shadow-md"
      >
        {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </Button>

      {/* New Chat Button */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        {!isCollapsed ? (
          <Button 
            onClick={onCreateNew}
            className="w-full flex items-center gap-2"
            variant="outline"
          >
            <Plus size={16} />
            New Chat
          </Button>
        ) : (
          <Button 
            onClick={onCreateNew}
            size="sm" 
            variant="outline" 
            className="w-full p-2"
          >
            <Plus size={16} />
          </Button>
        )}
      </div>
      
      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.map((conversation) => (
          <motion.div 
            key={conversation.id}
            whileHover={{ backgroundColor: "rgba(0,0,0,0.05)" }}
            className={`p-3 border-b cursor-pointer group ${
              currentConversationId === conversation.id 
                ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500' 
                : ''
            }`}
            onClick={() => onSwitchConversation(conversation.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <MessageSquare size={14} className="text-gray-500 flex-shrink-0" />
                  {!isCollapsed && (
                    <h4 className="text-sm font-medium truncate">
                      {conversation.room_name}
                    </h4>
                  )}
                </div>
                
                {!isCollapsed && conversation.last_message && (
                  <p className="text-xs text-gray-500 truncate">
                    {conversation.last_message}
                  </p>
                )}
                
                {!isCollapsed && (
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(conversation.last_message_at).toLocaleDateString()}
                  </p>
                )}
              </div>
              
              {!isCollapsed && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteConversation(conversation.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                >
                  <Trash2 size={12} />
                </Button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default ConversationSidebar;