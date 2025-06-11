
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Send, Paperclip, X, Bot, User, ThumbsUp, ThumbsDown, RotateCcw } from 'lucide-react';
import ModelSelector from './ModelSelector';
import ChatTabs from './ChatTabs';
import EmotionTokenPanel from './EmotionTokenPanel';
import ConversationTree from './ConversationTree';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  model?: string;
  emotion?: string;
  attachments?: File[];
  timestamp: Date;
  reactions?: {
    thumbsUp: boolean;
    thumbsDown: boolean;
  };
}

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-pro');
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isTreeOpen, setIsTreeOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');

  const handleSendMessage = () => {
    if (!inputValue.trim() && attachedFiles.length === 0) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      model: selectedModel,
      emotion: selectedEmotion,
      attachments: attachedFiles,
      timestamp: new Date(),
      reactions: { thumbsUp: false, thumbsDown: false }
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
    setAttachedFiles([]);
    setIsTyping(true);

    // Simulate AI response with typing indicator
    setTimeout(() => {
      setIsTyping(false);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `I understand you're using ${selectedModel}${selectedEmotion ? ` with a ${selectedEmotion} tone` : ''}. How can I help you today?`,
        sender: 'ai',
        model: selectedModel,
        timestamp: new Date(),
        reactions: { thumbsUp: false, thumbsDown: false }
      };
      setMessages(prev => [...prev, aiMessage]);
    }, 2000);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleExport = (format: 'txt' | 'md') => {
    const content = messages.map(msg => 
      `[${msg.timestamp.toLocaleString()}] ${msg.sender}: ${msg.content}`
    ).join('\n\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReaction = (messageId: string, reaction: 'thumbsUp' | 'thumbsDown') => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        return {
          ...msg,
          reactions: {
            ...msg.reactions,
            [reaction]: !msg.reactions?.[reaction],
            // Toggle off the opposite reaction
            [reaction === 'thumbsUp' ? 'thumbsDown' : 'thumbsUp']: false
          }
        };
      }
      return msg;
    }));
  };

  const regenerateResponse = (messageId: string) => {
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    if (messageIndex > 0) {
      const userMessage = messages[messageIndex - 1];
      setIsTyping(true);
      
      setTimeout(() => {
        setIsTyping(false);
        const newResponse: Message = {
          id: Date.now().toString(),
          content: `Here's an alternative response to: "${userMessage.content}"`,
          sender: 'ai',
          model: selectedModel,
          timestamp: new Date(),
          reactions: { thumbsUp: false, thumbsDown: false }
        };
        
        setMessages(prev => [
          ...prev.slice(0, messageIndex),
          newResponse,
          ...prev.slice(messageIndex + 1)
        ]);
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(120,119,198,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(120,119,198,0.02)_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-40" />

      {/* Conversation Tree */}
      <ConversationTree
        messages={messages}
        isOpen={isTreeOpen}
        onToggle={() => setIsTreeOpen(!isTreeOpen)}
        onExport={handleExport}
      />

      {/* Enhanced Header */}
      <motion.div
        className={`relative z-10 border-b border-zinc-800/50 backdrop-blur-xl ${
          isTreeOpen ? 'ml-80' : ''
        } transition-all duration-300`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="max-w-6xl mx-auto p-6">
          {/* Top Section with Logo and Model Selector */}
          <div className="flex items-center justify-between mb-6">
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-blue to-cyan-500 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent tracking-tight">
                  AI Chat Interface
                </h1>
                <p className="text-zinc-400 text-sm font-medium">
                  Powered by advanced language models
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <ModelSelector selectedModel={selectedModel} onModelSelect={setSelectedModel} />
            </motion.div>
          </div>

          {/* Tab Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <ChatTabs activeTab={activeTab} onTabChange={setActiveTab} />
          </motion.div>
        </div>
      </motion.div>

      {/* Messages Area */}
      <div className={`flex-1 overflow-auto relative ${isTreeOpen ? 'ml-80' : ''} transition-all duration-300`}>
        <div className="max-w-6xl mx-auto p-6">
          <AnimatePresence>
            {messages.length === 0 ? (
              <motion.div
                className="text-center py-20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <motion.div
                  className="w-20 h-20 bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-neon-blue/20"
                  animate={{ 
                    scale: [1, 1.05, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Send className="w-10 h-10 text-neon-blue" />
                </motion.div>
                <h3 className="text-3xl font-bold text-white mb-4 tracking-tight">
                  Start Your AI Conversation
                </h3>
                <p className="text-zinc-400 mb-2 text-lg">
                  Choose your preferred model and begin chatting with AI
                </p>
                <p className="text-sm text-zinc-500">
                  Add emotion tokens for personalized responses
                </p>
              </motion.div>
            ) : (
              <div className="space-y-8">
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ 
                      delay: index * 0.1,
                      duration: 0.4,
                      ease: "easeOut"
                    }}
                  >
                    <div
                      className={`max-w-[80%] group ${
                        message.sender === 'user' ? 'ml-12' : 'mr-12'
                      }`}
                    >
                      {/* Message Header */}
                      <div className={`flex items-center gap-3 mb-3 ${
                        message.sender === 'user' ? 'justify-end' : 'justify-start'
                      }`}>
                        {message.sender === 'ai' && (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-purple to-pink-500 flex items-center justify-center">
                            <Bot className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <div className={`flex items-center gap-2 ${
                          message.sender === 'user' ? 'flex-row-reverse' : ''
                        }`}>
                          <span className="text-sm font-semibold text-white tracking-tight">
                            {message.sender === 'user' ? 'You' : 'AI Assistant'}
                          </span>
                          {message.model && (
                            <Badge variant="outline" className="border-neon-blue/30 text-neon-blue text-xs bg-neon-blue/10">
                              {message.model}
                            </Badge>
                          )}
                          {message.emotion && (
                            <Badge variant="outline" className="border-neon-green/30 text-neon-green text-xs bg-neon-green/10">
                              {message.emotion}
                            </Badge>
                          )}
                        </div>
                        {message.sender === 'user' && (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-blue to-cyan-500 flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>

                      {/* Message Content */}
                      <motion.div
                        className={`p-6 rounded-2xl backdrop-blur-sm border transition-all duration-300 group-hover:shadow-lg ${
                          message.sender === 'user'
                            ? 'bg-gradient-to-br from-neon-blue/10 to-cyan-500/10 border-neon-blue/20 group-hover:border-neon-blue/40'
                            : 'bg-zinc-800/50 border-zinc-700/50 group-hover:border-zinc-600/60'
                        }`}
                        whileHover={{ scale: 1.01 }}
                        transition={{ duration: 0.2 }}
                      >
                        <p className="text-white leading-relaxed font-medium">
                          {message.content}
                        </p>
                        
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {message.attachments.map((file, fileIndex) => (
                              <motion.div
                                key={fileIndex}
                                className="px-3 py-2 bg-zinc-700/50 rounded-lg text-xs text-zinc-300 border border-zinc-600/50"
                                whileHover={{ scale: 1.05 }}
                              >
                                {file.name}
                              </motion.div>
                            ))}
                          </div>
                        )}
                        
                        <div className="mt-4 flex items-center justify-between">
                          <div className="text-xs text-zinc-400 font-medium">
                            {message.timestamp.toLocaleTimeString()}
                          </div>

                          {/* Reaction Buttons for AI Messages */}
                          {message.sender === 'ai' && (
                            <div className="flex items-center gap-2">
                              <motion.button
                                onClick={() => handleReaction(message.id, 'thumbsUp')}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                className={`p-2 rounded-lg transition-all duration-200 ${
                                  message.reactions?.thumbsUp
                                    ? 'bg-neon-green/20 text-neon-green'
                                    : 'bg-zinc-700/50 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                                }`}
                              >
                                <ThumbsUp className="w-3 h-3" />
                              </motion.button>
                              
                              <motion.button
                                onClick={() => handleReaction(message.id, 'thumbsDown')}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                className={`p-2 rounded-lg transition-all duration-200 ${
                                  message.reactions?.thumbsDown
                                    ? 'bg-red-500/20 text-red-400'
                                    : 'bg-zinc-700/50 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                                }`}
                              >
                                <ThumbsDown className="w-3 h-3" />
                              </motion.button>
                              
                              <motion.button
                                onClick={() => regenerateResponse(message.id)}
                                whileHover={{ scale: 1.1, rotate: 180 }}
                                whileTap={{ scale: 0.95 }}
                                className="p-2 rounded-lg bg-zinc-700/50 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-all duration-200"
                              >
                                <RotateCcw className="w-3 h-3" />
                              </motion.button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                ))}

                {/* Typing Indicator */}
                <AnimatePresence>
                  {isTyping && (
                    <motion.div
                      className="flex justify-start mr-12"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-purple to-pink-500 flex items-center justify-center">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="p-4 rounded-2xl bg-zinc-800/50 border border-zinc-700/50">
                          <div className="flex gap-1">
                            {[0, 1, 2].map((i) => (
                              <motion.div
                                key={i}
                                className="w-2 h-2 bg-neon-blue rounded-full"
                                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                                transition={{
                                  duration: 1,
                                  repeat: Infinity,
                                  delay: i * 0.2
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Enhanced Input Area */}
      <motion.div
        className={`border-t border-zinc-800/50 backdrop-blur-xl ${
          isTreeOpen ? 'ml-80' : ''
        } transition-all duration-300`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="max-w-6xl mx-auto p-6">
          {/* File Attachments */}
          <AnimatePresence>
            {attachedFiles.length > 0 && (
              <motion.div
                className="mb-4 flex flex-wrap gap-2"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                {attachedFiles.map((file, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center gap-2 bg-zinc-800/50 px-4 py-2 rounded-xl border border-zinc-700/50"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <span className="text-sm text-white font-medium">{file.name}</span>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-zinc-400 hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input Controls */}
          <div className="flex gap-4 items-end">
            <div className="flex gap-3">
              <EmotionTokenPanel
                selectedEmotion={selectedEmotion}
                onEmotionSelect={setSelectedEmotion}
              />
              <div className="relative">
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-12 px-4 border-zinc-700 hover:border-zinc-600 text-zinc-300 hover:text-white hover:bg-zinc-800/50 transition-all duration-200"
                  >
                    <Paperclip className="w-4 h-4 text-neon-green" />
                  </Button>
                </motion.div>
              </div>
            </div>

            <div className="flex-1">
              <Textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message... (Shift+Enter for new line)"
                className="resize-none bg-zinc-800/50 border-zinc-700/50 text-white placeholder:text-zinc-400 focus:border-neon-blue/50 focus:ring-2 focus:ring-neon-blue/20 rounded-xl backdrop-blur-sm transition-all duration-300 font-medium"
                rows={1}
              />
            </div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() && attachedFiles.length === 0}
                className="h-12 bg-gradient-to-r from-neon-blue to-cyan-500 hover:from-cyan-500 hover:to-neon-blue text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-xl px-6 transition-all duration-300 font-medium"
              >
                <Send className="w-5 h-5" />
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ChatInterface;
