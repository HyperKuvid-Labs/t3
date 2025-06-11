
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, MessageSquare, Download, Save } from 'lucide-react';

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
        className="fixed left-4 top-20 z-40 border-neon-blue/50 hover:border-neon-blue text-neon-text hover:bg-neon-blue/10"
      >
        {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </Button>

      {/* Panel */}
      <div
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-neon-dark/95 backdrop-blur-sm border-r border-neon-blue/20 z-30 transition-all duration-300 ${
          isOpen ? 'w-80 translate-x-0' : 'w-0 -translate-x-full'
        }`}
      >
        {isOpen && (
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-neon-blue/20">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-neon-text">Conversation Tree</h3>
                <div className="flex gap-1">
                  <Button
                    onClick={() => onExport('md')}
                    variant="ghost"
                    size="sm"
                    className="text-neon-muted hover:text-neon-text"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => onExport('txt')}
                    variant="ghost"
                    size="sm"
                    className="text-neon-muted hover:text-neon-text"
                  >
                    <Save className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <Badge variant="outline" className="border-neon-blue/50 text-neon-blue">
                {messages.length} messages
              </Badge>
            </div>

            {/* Messages List */}
            <div className="flex-1 overflow-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center py-8 text-neon-muted">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No messages yet</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    onClick={() => setSelectedMessage(message.id)}
                    className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedMessage === message.id
                        ? 'bg-neon-blue/20 border border-neon-blue'
                        : 'hover:bg-neon-muted/10 border border-transparent hover:border-neon-blue/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        variant="outline"
                        className={
                          message.sender === 'user'
                            ? 'border-neon-green/50 text-neon-green'
                            : 'border-neon-purple/50 text-neon-purple'
                        }
                      >
                        {message.sender}
                      </Badge>
                      {message.model && (
                        <Badge variant="outline" className="border-neon-blue/50 text-neon-blue text-xs">
                          {message.model}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-neon-text truncate">{message.content}</p>
                    <p className="text-xs text-neon-muted mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ConversationTree;
