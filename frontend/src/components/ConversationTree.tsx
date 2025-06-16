import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, MessageSquare, Download, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ConversationNode {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  model?: string;
  emotion?: string;
}

interface ConversationTreeProps {
  messages: ConversationNode[];
  isOpen: boolean;
  onToggle: () => void;
  onExport: (format: 'txt' | 'md') => void;
}

const ConversationTree = ({ messages, isOpen, onToggle, onExport }: ConversationTreeProps) => {
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);

  return (
    <>
      {/* Toggle Button */}
      <Button
        onClick={onToggle}
        variant="outline"
        size="sm"
        className="fixed left-4 top-20 z-40 border-slate-700/50 hover:border-purple-500/50 bg-slate-800/50 hover:bg-slate-700/50"
      >
        {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </Button>

      {/* Panel */}
      <motion.div
        initial={false}
        animate={{
          x: isOpen ? 0 : -320,
          opacity: isOpen ? 1 : 0
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed left-0 top-16 h-[calc(100vh-4rem)] bg-slate-900/95 backdrop-blur-sm border-r border-slate-700/50 z-30 w-80"
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-700/50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-white">Conversation History</h3>
              <div className="flex gap-1">
                <Button
                  onClick={() => {
                    onExport('md');
                    toast({ title: "Exported as Markdown" });
                  }}
                  variant="ghost"
                  size="sm"
                  className="text-slate-400 hover:text-white"
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => {
                    onExport('txt');
                    toast({ title: "Exported as Text" });
                  }}
                  variant="ghost"
                  size="sm"
                  className="text-slate-400 hover:text-white"
                >
                  <Save className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <Badge variant="outline" className="border-purple-500/50 text-purple-400">
              {messages.length} messages
            </Badge>
          </div>

          {/* Messages List */}
          <div className="flex-1 overflow-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <motion.div
                className="text-center py-8 text-slate-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No messages yet</p>
              </motion.div>
            ) : (
              messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setSelectedMessage(message.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedMessage === message.id
                      ? 'bg-purple-500/20 border border-purple-500/50'
                      : 'hover:bg-slate-800/50 border border-transparent hover:border-purple-500/30'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant="outline"
                      className={
                        message.sender === 'user'
                          ? 'border-green-500/50 text-green-400'
                          : 'border-blue-500/50 text-blue-400'
                      }
                    >
                      {message.sender}
                    </Badge>
                    {message.model && (
                      <Badge 
                        variant="outline" 
                        className="border-purple-500/50 text-purple-400 text-xs"
                      >
                        {message.model}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-slate-200 truncate">{message.content}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default ConversationTree;