import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Send, Paperclip, X, Bot, User, ThumbsUp, ThumbsDown, RotateCcw,
  Sparkles, Zap, Settings, Download, Share, Copy, MessageSquare,
  Clock, CheckCircle2, Circle, Mic, Image, FileText, Video,
  MoreHorizontal, Search, Filter, Star, Heart, Smile, AlertTriangle,
  Wifi, WifiOff, RefreshCw, Shield, Database
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import ModelSelector from './ModelSelector';
import ChatTabs from './ChatTabs';
import EmotionTokenPanel from './EmotionTokenPanel';
import ConversationTree from './ConversationTree';
import { 
  sendQueryToBackend, 
  checkBackendHealth, 
  getCurrentUser,
  type ModelType,
  type ChatResponse 
} from '@/api/chatService';

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
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'error';
  queryId?: string;
  error?: string;
}

interface User {
  id: string;
  username: string;
  email: string;
}

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [selectedModel, setSelectedModel] = useState<ModelType>('gemini-2.5-pro');
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isTreeOpen, setIsTreeOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [isRecording, setIsRecording] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [isBackendHealthy, setIsBackendHealthy] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { scrollYProgress } = useScroll({ container: messagesRef });
  
  const headerOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0.95]);
  const headerBlur = useTransform(scrollYProgress, [0, 0.1], [0, 8]);

  // Check backend health on mount
  useEffect(() => {
    const checkHealth = async () => {
      const healthy = await checkBackendHealth();
      setIsBackendHealthy(healthy);
      
      if (!healthy) {
        toast({
          title: "Connection Issue",
          description: "Unable to connect to the backend. Please check if the server is running on localhost:8000",
          variant: "destructive"
        });
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Get current user on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error('Failed to get user:', error);
        toast({
          title: "Authentication Required",
          description: "Please log in to start chatting.",
          variant: "destructive"
        });
      }
    };

    fetchUser();
  }, []);

  useGSAP(() => {
    // Enhanced entrance animations
    gsap.timeline()
      .from(".chat-header", {
        y: -100,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out"
      })
      .from(".chat-sidebar", {
        x: -300,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
      }, "-=0.8")
      .from(".chat-main", {
        scale: 0.95,
        opacity: 0,
        duration: 1,
        ease: "power2.out"
      }, "-=0.6")
      .from(".chat-input", {
        y: 100,
        opacity: 0,
        duration: 0.8,
        ease: "back.out(1.7)"
      }, "-=0.4");

    // Floating particles animation
    gsap.to(".particle", {
      y: "random(-20, 20)",
      x: "random(-20, 20)",
      rotation: "random(-180, 180)",
      duration: "random(3, 6)",
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      stagger: {
        amount: 2,
        from: "random"
      }
    });
  }, { scope: containerRef });

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() && attachedFiles.length === 0) return;
    
    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please log in to send messages.",
        variant: "destructive"
      });
      return;
    }

    if (!isBackendHealthy) {
      toast({
        title: "Connection Error",
        description: "Backend server is not available. Please try again later.",
        variant: "destructive"
      });
      return;
    }

    const messageId = Date.now().toString();
    const userMessage: Message = {
      id: messageId,
      content: inputValue,
      sender: 'user',
      model: selectedModel,
      emotion: selectedEmotion,
      attachments: attachedFiles,
      timestamp: new Date(),
      reactions: { thumbsUp: false, thumbsDown: false },
      status: 'sending'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setAttachedFiles([]);
    setIsTyping(true);

    // Animate message status changes
    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, status: 'sent' } : msg
      ));
    }, 500);

    try {
      // Send to backend
      const response: ChatResponse = await sendQueryToBackend(
        inputValue.trim(), 
        selectedEmotion || '', 
        selectedModel
      );

      // Update user message status
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, status: 'delivered', queryId: response.query_id } : msg
      ));

      // Add AI response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.response,
        sender: 'ai',
        model: response.model,
        emotion: selectedEmotion,
        timestamp: new Date(),
        reactions: { thumbsUp: false, thumbsDown: false },
        status: 'read',
        queryId: response.query_id
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Mark user message as read
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, status: 'read' } : msg
      ));

      // Reset retry count on success
      setRetryCount(0);

      // Success toast
      toast({
        title: "Message Sent",
        description: `Response received from ${response.model}`,
      });

    } catch (error: any) {
      console.error('Send message error:', error);
      
      // Update user message with error status
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { 
          ...msg, 
          status: 'error', 
          error: error.message 
        } : msg
      ));

      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        content: `Sorry, I encountered an error: ${error.message}`,
        sender: 'ai',
        timestamp: new Date(),
        status: 'error',
        error: error.message
      };

      setMessages(prev => [...prev, errorMessage]);

      // Show retry option for certain errors
      if (retryCount < 3 && (error.message.includes('timeout') || error.message.includes('network'))) {
        toast({
          title: "Message Failed",
          description: "Would you like to retry?",
          variant: "destructive",
          action: (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setRetryCount(prev => prev + 1);
                setInputValue(userMessage.content);
                setSelectedEmotion(userMessage.emotion || null);
              }}
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Retry
            </Button>
          )
        });
      } else {
        toast({
          title: "Message Failed",
          description: error.message,
          variant: "destructive"
        });
      }
    } finally {
      setIsTyping(false);
    }
  }, [inputValue, attachedFiles, currentUser, isBackendHealthy, selectedModel, selectedEmotion, retryCount]);

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

  const handleReaction = (messageId: string, reaction: 'thumbsUp' | 'thumbsDown') => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        return {
          ...msg,
          reactions: {
            ...msg.reactions,
            [reaction]: !msg.reactions?.[reaction],
            [reaction === 'thumbsUp' ? 'thumbsDown' : 'thumbsUp']: false
          }
        };
      }
      return msg;
    }));
  };

  const handleRetryMessage = (messageId: string) => {
    const message = messages.find(msg => msg.id === messageId);
    if (message && message.sender === 'user') {
      setInputValue(message.content);
      setSelectedEmotion(message.emotion || null);
      setSelectedModel(message.model as ModelType || 'gemini-2.5-pro');
    }
  };

  const getStatusIcon = (status?: string, error?: string) => {
    switch (status) {
      case 'sending': return <Circle className="w-3 h-3 text-slate-400 animate-pulse" />;
      case 'sent': return <CheckCircle2 className="w-3 h-3 text-slate-400" />;
      case 'delivered': return <CheckCircle2 className="w-3 h-3 text-blue-400" />;
      case 'read': return <CheckCircle2 className="w-3 h-3 text-green-400" />;
      case 'error': return (
        <div className="flex items-center gap-1">
          <AlertTriangle className="w-3 h-3 text-red-400" />
          <span className="text-xs text-red-400" title={error}>Failed</span>
        </div>
      );
      default: return null;
    }
  };

  const getModelDisplayName = (model: string) => {
    const modelNames: Record<string, string> = {
      'gemini-2.5-flash': 'Gemini 2.5 Flash',
      'gemini-2.5-pro': 'Gemini 2.5 Pro',
      'ollama-gemma3': 'Ollama Gemma 3',
      'ollama-llama3': 'Ollama Llama 3',
      'ollama-deepseek': 'Ollama DeepSeek',
      'ollama-phi': 'Ollama Phi'
    };
    return modelNames[model] || model;
  };

  return (
    <div ref={containerRef} className="min-h-screen flex bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse particle" />
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl animate-pulse particle" />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl animate-pulse particle" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(120,119,198,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(120,119,198,0.03)_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-40" />
        
        {/* Floating Orbs */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-purple-400/20 to-blue-400/20 rounded-full particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Conversation Tree Sidebar */}
      <motion.div
        className="chat-sidebar"
        animate={{ x: isTreeOpen ? 0 : -320 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <ConversationTree
          messages={messages}
          isOpen={isTreeOpen}
          onToggle={() => setIsTreeOpen(!isTreeOpen)}
          onExport={(format) => {
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
          }}
        />
      </motion.div>

      {/* Main Chat Container */}
      <div className="flex-1 flex flex-col relative">
        {/* Enhanced Header */}
        <motion.div
          className="chat-header relative z-20 border-b border-slate-800/50 backdrop-blur-xl"
          style={{ 
            opacity: headerOpacity,
            backdropFilter: `blur(${headerBlur}px)`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/60 to-slate-900/80" />
          
          <div className="relative max-w-7xl mx-auto p-6">
            {/* Top Section */}
            <div className="flex items-center justify-between mb-6">
              <motion.div
                className="flex items-center gap-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Button
                  onClick={() => setIsTreeOpen(!isTreeOpen)}
                  variant="outline"
                  size="sm"
                  className="border-slate-700 hover:border-purple-500/50 bg-slate-800/50 hover:bg-slate-700/50"
                >
                  <MessageSquare className="w-4 h-4" />
                </Button>
                
                <div className="flex items-center gap-3">
                  <motion.div
                    className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/25"
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Bot className="w-6 h-6 text-white" />
                  </motion.div>
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent tracking-tight">
                      AI Chat Studio
                    </h1>
                    <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                      <div className={`w-2 h-2 rounded-full ${isBackendHealthy ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                      {isBackendHealthy ? 'Connected to backend' : 'Backend offline'}
                      {currentUser && (
                        <>
                          <span className="text-slate-600">•</span>
                          <div className="flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            <span>{currentUser.username}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-slate-400 hover:text-white"
                    onClick={() => checkBackendHealth().then(setIsBackendHealthy)}
                  >
                    {isBackendHealthy ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                    <Database className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
                <ModelSelector selectedModel={selectedModel} onModelSelect={setSelectedModel} />
              </motion.div>
            </div>

            {/* Tab Navigation with Stats */}
            <motion.div
              className="flex items-center justify-between"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <ChatTabs activeTab={activeTab} onTabChange={setActiveTab} />
              
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  <span>{messages.length} messages</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Model: {getModelDisplayName(selectedModel)}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Messages Area */}
        <div 
          ref={messagesRef}
          className="chat-main flex-1 overflow-auto relative scroll-smooth"
          style={{ scrollBehavior: 'smooth' }}
        >
          <div className="max-w-6xl mx-auto p-6">
            <AnimatePresence mode="popLayout">
              {messages.length === 0 ? (
                <motion.div
                  className="text-center py-20"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                >
                  <motion.div
                    className="relative w-24 h-24 mx-auto mb-8"
                    animate={{ 
                      rotate: [0, 5, -5, 0],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{ 
                      duration: 4, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-3xl border border-purple-500/20" />
                    <div className="absolute inset-2 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center">
                      <Sparkles className="w-10 h-10 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                      <Zap className="w-3 h-3 text-white" />
                    </div>
                  </motion.div>
                  
                  <h3 className="text-4xl font-bold text-white mb-4 tracking-tight">
                    Start Your AI Journey
                  </h3>
                  <p className="text-xl text-slate-400 mb-2 max-w-md mx-auto leading-relaxed">
                    Choose your preferred model and begin an intelligent conversation
                  </p>
                  <p className="text-sm text-slate-500">
                    Add emotion tokens for personalized responses
                  </p>

                  {/* Connection Status */}
                  {!isBackendHealthy && (
                    <motion.div
                      className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl max-w-md mx-auto"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <div className="flex items-center gap-2 text-red-400">
                        <WifiOff className="w-5 h-5" />
                        <span className="font-medium">Backend Offline</span>
                      </div>
                      <p className="text-sm text-red-300 mt-1">
                        Please ensure the backend server is running on localhost:8000
                      </p>
                    </motion.div>
                  )}

                  {/* Quick Start Suggestions */}
                  {isBackendHealthy && (
                    <motion.div
                      className="mt-8 flex flex-wrap justify-center gap-3"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                    >
                      {[
                        "Help me write code",
                        "Explain a concept",
                        "Creative writing",
                        "Problem solving"
                      ].map((suggestion, index) => (
                        <motion.button
                          key={suggestion}
                          onClick={() => setInputValue(suggestion)}
                          className="px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 hover:border-purple-500/50 rounded-xl text-slate-300 hover:text-white transition-all duration-300"
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.9 + index * 0.1 }}
                        >
                          {suggestion}
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <div className="space-y-8">
                  {messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      initial={{ opacity: 0, y: 30, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -30, scale: 0.9 }}
                      transition={{ 
                        delay: index * 0.05,
                        duration: 0.5,
                        ease: "easeOut"
                      }}
                      layout
                    >
                      <div className={`max-w-[75%] group ${message.sender === 'user' ? 'ml-16' : 'mr-16'}`}>
                        {/* Message Header */}
                        <div className={`flex items-center gap-3 mb-3 ${
                          message.sender === 'user' ? 'justify-end' : 'justify-start'
                        }`}>
                          {message.sender === 'ai' && (
                            <motion.div
                              className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center shadow-lg"
                              whileHover={{ scale: 1.1, rotate: 5 }}
                            >
                              <Bot className="w-5 h-5 text-white" />
                            </motion.div>
                          )}
                          
                          <div className={`flex items-center gap-2 ${
                            message.sender === 'user' ? 'flex-row-reverse' : ''
                          }`}>
                            <span className="text-sm font-semibold text-white">
                              {message.sender === 'user' ? 'You' : 'AI Assistant'}
                            </span>
                            {message.model && (
                              <Badge variant="outline" className="border-purple-500/30 text-purple-400 text-xs bg-purple-500/10">
                                {getModelDisplayName(message.model)}
                              </Badge>
                            )}
                            {message.emotion && (
                              <Badge variant="outline" className="border-green-500/30 text-green-400 text-xs bg-green-500/10">
                                {message.emotion}
                              </Badge>
                            )}
                            {message.queryId && (
                              <Badge variant="outline" className="border-blue-500/30 text-blue-400 text-xs bg-blue-500/10">
                                ID: {message.queryId.slice(-6)}
                              </Badge>
                            )}
                          </div>
                          
                          {message.sender === 'user' && (
                            <motion.div
                              className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg"
                              whileHover={{ scale: 1.1, rotate: -5 }}
                            >
                              <User className="w-5 h-5 text-white" />
                            </motion.div>
                          )}
                        </div>

                        {/* Message Bubble */}
                        <motion.div
                          className={`relative p-6 rounded-3xl backdrop-blur-sm border transition-all duration-300 group-hover:shadow-xl ${
                            message.sender === 'user'
                              ? message.status === 'error'
                                ? 'bg-gradient-to-br from-red-600/15 to-red-500/15 border-red-500/25 group-hover:border-red-400/40 shadow-red-500/10'
                                : 'bg-gradient-to-br from-blue-600/15 to-cyan-500/15 border-blue-500/25 group-hover:border-blue-400/40 shadow-blue-500/10'
                              : message.status === 'error'
                              ? 'bg-red-800/60 border-red-700/50 group-hover:border-red-600/70 shadow-red-900/20'
                              : 'bg-slate-800/60 border-slate-700/50 group-hover:border-slate-600/70 shadow-slate-900/20'
                          }`}
                          whileHover={{ scale: 1.01, y: -2 }}
                          transition={{ duration: 0.2 }}
                        >
                          {/* Message Content */}
                          <p className="text-white leading-relaxed font-medium text-[15px]">
                            {message.content}
                          </p>
                          
                          {/* Error Details */}
                          {message.error && (
                            <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                              <p className="text-red-300 text-sm">{message.error}</p>
                              {message.sender === 'user' && (
                                <Button
                                  onClick={() => handleRetryMessage(message.id)}
                                  variant="outline"
                                  size="sm"
                                  className="mt-2 border-red-500/30 text-red-400 hover:bg-red-500/10"
                                >
                                  <RefreshCw className="w-3 h-3 mr-1" />
                                  Retry
                                </Button>
                              )}
                            </div>
                          )}
                          
                          {/* Attachments */}
                          {message.attachments && message.attachments.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                              {message.attachments.map((file, fileIndex) => (
                                <motion.div
                                  key={fileIndex}
                                  className="flex items-center gap-2 px-3 py-2 bg-slate-700/50 rounded-xl text-xs text-slate-300 border border-slate-600/50"
                                  whileHover={{ scale: 1.05 }}
                                >
                                  <FileText className="w-3 h-3" />
                                  {file.name}
                                </motion.div>
                              ))}
                            </div>
                          )}
                          
                          {/* Message Footer */}
                          <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                              <span>{message.timestamp.toLocaleTimeString()}</span>
                              {message.sender === 'user' && getStatusIcon(message.status, message.error)}
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              {message.sender === 'ai' && !message.error && (
                                <>
                                  <motion.button
                                    onClick={() => handleReaction(message.id, 'thumbsUp')}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`p-2 rounded-lg transition-all duration-200 ${
                                      message.reactions?.thumbsUp
                                        ? 'bg-green-500/20 text-green-400'
                                        : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-white'
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
                                        : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-white'
                                    }`}
                                  >
                                    <ThumbsDown className="w-3 h-3" />
                                  </motion.button>
                                  
                                  <motion.button
                                    whileHover={{ scale: 1.1, rotate: 180 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="p-2 rounded-lg bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-white transition-all duration-200"
                                  >
                                    <RotateCcw className="w-3 h-3" />
                                  </motion.button>
                                </>
                              )}
                              
                              <motion.button
                                onClick={() => {
                                  navigator.clipboard.writeText(message.content);
                                  toast({
                                    title: "Copied",
                                    description: "Message copied to clipboard",
                                  });
                                }}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                className="p-2 rounded-lg bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-white transition-all duration-200"
                              >
                                <Copy className="w-3 h-3" />
                              </motion.button>
                              
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                className="p-2 rounded-lg bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-white transition-all duration-200"
                              >
                                <MoreHorizontal className="w-3 h-3" />
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Enhanced Typing Indicator */}
                  <AnimatePresence>
                    {isTyping && (
                      <motion.div
                        className="flex justify-start mr-16"
                        initial={{ opacity: 0, y: 30, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -30, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex items-center gap-3">
                          <motion.div
                            className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center shadow-lg"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          >
                            <Bot className="w-5 h-5 text-white" />
                          </motion.div>
                          <div className="p-4 rounded-3xl bg-slate-800/60 border border-slate-700/50 backdrop-blur-sm">
                            <div className="flex items-center gap-1">
                              <span className="text-sm text-slate-400 mr-2">
                                {getModelDisplayName(selectedModel)} is thinking
                              </span>
                              {[0, 1, 2].map((i) => (
                                <motion.div
                                  key={i}
                                  className="w-2 h-2 bg-purple-400 rounded-full"
                                  animate={{ 
                                    scale: [1, 1.5, 1], 
                                    opacity: [0.5, 1, 0.5] 
                                  }}
                                  transition={{
                                    duration: 1.5,
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
          className="chat-input border-t border-slate-800/50 backdrop-blur-xl bg-slate-900/50"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <div className="max-w-6xl mx-auto p-6">
            {/* File Attachments Preview */}
            <AnimatePresence>
              {attachedFiles.length > 0 && (
                <motion.div
                  className="mb-4 flex flex-wrap gap-3"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {attachedFiles.map((file, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center gap-3 bg-slate-800/60 px-4 py-3 rounded-2xl border border-slate-700/50 backdrop-blur-sm"
                      initial={{ opacity: 0, scale: 0.8, x: -20 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.8, x: 20 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                    >
                      <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-purple-400" />
                      </div>
                      <div>
                        <span className="text-sm text-white font-medium block">{file.name}</span>
                        <span className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</span>
                      </div>
                      <motion.button
                        onClick={() => removeFile(index)}
                        className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-700/50"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <X className="w-4 h-4" />
                      </motion.button>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input Controls */}
            <div className="flex gap-4 items-end">
              {/* Left Controls */}
              <div className="flex gap-3">
                <EmotionTokenPanel
                  selectedEmotion={selectedEmotion}
                  onEmotionSelect={setSelectedEmotion}
                />
                
                {/* File Upload */}
                <div className="relative">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={!isBackendHealthy}
                  />
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!isBackendHealthy}
                      className="h-12 px-4 border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all duration-200 disabled:opacity-50"
                    >
                      <Paperclip className="w-4 h-4 text-purple-400" />
                    </Button>
                  </motion.div>
                </div>

                {/* Voice Recording */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsRecording(!isRecording)}
                    disabled={!isBackendHealthy}
                    className={`h-12 px-4 transition-all duration-200 disabled:opacity-50 ${
                      isRecording
                        ? 'border-red-500/50 bg-red-500/10 text-red-400'
                        : 'border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <Mic className={`w-4 h-4 ${isRecording ? 'animate-pulse' : ''}`} />
                  </Button>
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowQuickActions(!showQuickActions)}
                    disabled={!isBackendHealthy}
                    className="h-12 px-4 border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all duration-200 disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                  </Button>
                </motion.div>
              </div>

              {/* Text Input */}
              <div className="flex-1 relative">
                <Textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    !isBackendHealthy 
                      ? "Backend offline - please check connection..."
                      : !currentUser
                      ? "Please log in to start chatting..."
                      : "Type your message... (Shift+Enter for new line)"
                  }
                  disabled={!isBackendHealthy || !currentUser || isTyping}
                  className="resize-none bg-slate-800/60 border-slate-700/50 text-white placeholder:text-slate-400 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 rounded-2xl backdrop-blur-sm transition-all duration-300 font-medium text-[15px] leading-relaxed pr-12 disabled:opacity-50 disabled:cursor-not-allowed"
                  rows={1}
                  style={{ minHeight: '48px', maxHeight: '120px' }}
                />
                
                {/* Character Count */}
                <div className="absolute bottom-2 right-3 text-xs text-slate-500">
                  {inputValue.length}/2000
                </div>
              </div>

              {/* Send Button */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={handleSendMessage}
                  disabled={(!inputValue.trim() && attachedFiles.length === 0) || !isBackendHealthy || !currentUser || isTyping}
                  className="h-12 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 hover:from-purple-700 hover:via-blue-700 hover:to-cyan-600 text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl px-6 transition-all duration-300 font-medium shadow-lg shadow-purple-500/25 disabled:shadow-none"
                >
                  {isTyping ? (
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </motion.div>
            </div>

            {/* Quick Actions Panel */}
            <AnimatePresence>
              {showQuickActions && isBackendHealthy && (
                <motion.div
                  className="mt-4 p-4 bg-slate-800/60 rounded-2xl border border-slate-700/50 backdrop-blur-sm"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-medium text-white">Quick Actions</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { icon: Copy, label: 'Summarize', action: 'Please summarize the above conversation' },
                      { icon: Star, label: 'Improve', action: 'How can I improve this?' },
                      { icon: Heart, label: 'Explain', action: 'Please explain this in simple terms' },
                      { icon: Smile, label: 'Continue', action: 'Please continue with this topic' }
                    ].map((item, index) => (
                      <motion.button
                        key={item.label}
                        onClick={() => {
                          setInputValue(item.action);
                          setShowQuickActions(false);
                        }}
                        className="flex items-center gap-2 px-3 py-2 bg-slate-700/50 hover:bg-slate-600/50 rounded-xl text-sm text-slate-300 hover:text-white transition-all duration-200"
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ChatInterface;
