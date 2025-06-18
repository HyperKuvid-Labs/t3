"use client";

import type React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import { useScroll, useTransform, AnimatePresence, motion } from "framer-motion";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { toast } from "@/hooks/use-toast";
import ChatHeader from "./chat/chat_header";
import ChatInput from "./chat/chat_input";
import MessageBubble from "./chat/message_bubble";
import TypingIndicator from "./chat/typing_indicator";
import EmptyState from "./chat/empty_state";
import ConversationTreeView, {processMessagesForTree} from "./ConversationTree";
import HistoryView from "./ConversationSidebar";

import {
  sendQueryToBackend,
  checkBackendHealth,
  getCurrentUser,
  type ModelType,
  type ChatResponse,
  getConversations,
  newConversation,
  deleteTheConversation,
  getConversationWithId,
} from "@/api/chatService";
import {models} from "./ModelSelector"

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  model?: string;
  emotion?: string;
  attachments?: File[];
  timestamp: Date;
  reactions?: {
    thumbsUp: boolean;
    thumbsDown: boolean;
  };
  status?: "sending" | "sent" | "delivered" | "read" | "error";
  error?: string;
  parentMessageId?: string;
  conversationId?: number;
}

interface ChatUser {
  id: string;
  username: string;
  email: string;
}

interface Conversation {
  id: number;
  room_name: string;
  last_message_at: string;
  last_message?: string;
  ai_model: string;
  type: string;
  aiEnabled: boolean;
}

interface MessageTree {
  id: number;
  content: string;
  role: string;
  messageType: string;
  createdAt: string;
  user: any;
  children: MessageTree[];
}

// return {
//             "conversation_id": conversation.id,
//             "room_name": conversation.roomName,
//             "created_at": conversation.createdAt.isoformat() if conversation.createdAt else None
//         }
interface ConversationResponse {
  conversation_id: number;
  room_name: string;
  created_at: string;
}

interface ChatInterfaceProps {
  onTabChange?: (tab: string) => void;
}

const ChatInterface = ({ onTabChange }: ChatInterfaceProps = {}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [selectedModel, setSelectedModel] = useState<string>(() => {
    // Initialize with localStorage value or default
    const saved = localStorage.getItem("gidvion-selected-model");
    return saved && models.find((m) => m.id === saved)
      ? saved
      : "gemini-2.5-pro";
  });
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isTreeOpen, setIsTreeOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [isBackendHealthy, setIsBackendHealthy] = useState(true);
  const [currentUser, setCurrentUser] = useState<ChatUser | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<
    number | null
  >(null);
  const [messageTree, setMessageTree] = useState<MessageTree[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [processedMessages, setProcessedMessages] = useState<Message[]>([]);
  // const [activeTab, setActiveTab] = useState("chat");

  useEffect(() => {
    setProcessedMessages(processMessagesForTree(messages));
  }, [messages]);

  const containerRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    container: messagesRef,
    offset: ["start start", "end end"],
  });

  const headerOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0.95]);
  const headerBlur = useTransform(scrollYProgress, [0, 0.1], [0, 8]);

  const formatMessagesForContext = (messages: Message[], limit = 10) => {
    return messages
      .slice(-limit)
      .map((msg) => `${msg.sender}: ${msg.content}`)
      .join("\n");
  };

  const getModelDisplayName = (model: string) => {
    const modelNames: Record<string, string> = {
      "gemini-2.5-flash": "Gemini 2.5 Flash",
      "gemini-2.5-pro": "Gemini 2.5 Pro",
      "ollama-gemma3": "Ollama Gemma 3",
      "ollama-llama3": "Ollama Llama 3",
      "ollama-deepseek": "Ollama DeepSeek",
      "ollama-phi": "Ollama Phi",
    };
    return modelNames[model] || model;
  };

  // Persist messages to localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem("chat-messages");
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        setMessages(
          parsed.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          }))
        );
      } catch (error) {
        console.error("Failed to load saved messages:", error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("chat-messages", JSON.stringify(messages));
  }, [messages]);

  // Check backend health on mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const healthy = await checkBackendHealth();
        setIsBackendHealthy(healthy);

        if (!healthy) {
          toast({
            title: "Connection Issue",
            description:
              "Unable to connect to the backend. Please check if the server is running on localhost:8000",
            variant: "destructive",
          });
        }
      } catch (error) {
        setIsBackendHealthy(false);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  // Get current user on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error("Failed to get user:", error);
        toast({
          title: "Authentication Required",
          description: "Please log in to start chatting.",
          variant: "destructive",
        });
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    const initializeChat = async () => {
      const conversations = await getConversations();
      if (conversations.length > 0) {
        setCurrentConversationId(conversations[0].id); // Use first conversation
      } else {
        // Create a default conversation if none exist
        const newConvo = await newConversation(
          "Default Chat",
          "gemini-2.5-pro"
        );
        setCurrentConversationId(newConvo.conversation_id);
      }
    };
    initializeChat();
  }, []);

  useGSAP(
    () => {
      // Enhanced entrance animations
      gsap
        .timeline()
        .set(".chat-input", { 
          position: "sticky",
          bottom: 0,
          clearProps: "transform" // Clear transform after animation
        })
        .from(".chat-input", {
          y: 100,
          opacity: 0,
          duration: 0.8,
          ease: "backOut",
          onComplete: () => {
            gsap.set(".chat-input", { clearProps: "transform" });
          }
        })
        .from(
          ".chat-sidebar",
          {
            x: -300,
            opacity: 0,
            duration: 1,
            ease: "power3.out",
          },
          "-=0.8"
        )
        .from(
          ".chat-main",
          {
            scale: 0.95,
            opacity: 0,
            duration: 1,
            ease: "power2.out",
          },
          "-=0.6"
        )
        .from(
          ".chat-input",
          {
            y: 100,
            opacity: 0,
            duration: 0.8,
            ease: "backOut",
          },
          "-=0.4"
        );

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
          from: "random",
        },
      });
    },
    { scope: containerRef }
  );

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() && attachedFiles.length === 0) return;

    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please log in to send messages.",
        variant: "destructive",
      });
      return;
    }

    if (!isBackendHealthy) {
      toast({
        title: "Connection Error",
        description: "Backend server is not available. Please try again later.",
        variant: "destructive",
      });
      return;
    }

    if (!currentConversationId) {
      throw new Error("No active conversation");
    }

    const previousContext = formatMessagesForContext(messages);
    // const fullPrompt = `Previous conversation:\n${previousContext}\n\nUser: ${inputValue}`;

    const messageId = Date.now().toString();
    const userMessage: Message = {
      id: messageId,
      content: inputValue,
      sender: "user",
      model: selectedModel,
      emotion: selectedEmotion || undefined,
      attachments: attachedFiles,
      timestamp: new Date(),
      reactions: { thumbsUp: false, thumbsDown: false },
      status: "sending",
      conversationId: currentConversationId || undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setAttachedFiles([]);
    setIsTyping(true);

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, status: "sent" } : msg
        )
      );
    }, 500);

    try {
      const response: ChatResponse = await sendQueryToBackend(
        inputValue,
        previousContext,
        selectedEmotion || "",
        selectedModel,
        currentConversationId,
        attachedFiles,
        webSearchEnabled
      );

      // Update user message status
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, status: "delivered" } : msg
        )
      );

      // Add AI response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.response,
        sender: "ai",
        model: response.model,
        emotion: selectedEmotion || undefined,
        timestamp: new Date(),
        reactions: { thumbsUp: false, thumbsDown: false },
        status: "read",
        conversationId: currentConversationId || undefined,
      };

      setMessages((prev) => [...prev, aiMessage]);
      localStorage.setItem(
        "chat-messages",
        JSON.stringify([...messages, userMessage, aiMessage])
      );

      // Mark user message as read
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, status: "read" } : msg
        )
      );

      // Reset retry count on success
      setRetryCount(0);

      // Success toast
      toast({
        title: "Message Sent",
        description: `Response received from ${response.model}`,
      });
    } catch (error: any) {
      console.error("Send message error:", error);

      // Update user message with error status
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? {
                ...msg,
                status: "error",
                error: error.message,
              }
            : msg
        )
      );

      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        content: `Sorry, I encountered an error: ${error.message}`,
        sender: "ai",
        timestamp: new Date(),
        status: "error",
        error: error.message,
        conversationId: currentConversationId || undefined,
      };

      setMessages((prev) => [...prev, errorMessage]);

      toast({
        title: "Message Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
    }
  }, [
    inputValue,
    attachedFiles,
    currentUser,
    isBackendHealthy,
    selectedModel,
    selectedEmotion,
    retryCount,
    messages,
    currentConversationId,
    webSearchEnabled,
  ]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachedFiles((prev) => [...prev, ...files]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleReaction = (
    messageId: string,
    reaction: "thumbsUp" | "thumbsDown"
  ) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId) {
          return {
            ...msg,
            reactions: {
              ...msg.reactions,
              [reaction]: !msg.reactions?.[reaction],
              [reaction === "thumbsUp" ? "thumbsDown" : "thumbsUp"]: false,
            },
          };
        }
        return msg;
      })
    );
  };

  const handleRetryMessage = (messageId: string) => {
    const message = messages.find((msg) => msg.id === messageId);
    if (message && message.sender === "user") {
      setInputValue(message.content);
      setSelectedEmotion(message.emotion || null);
      setSelectedModel((message.model as ModelType) || "gemini-2.5-pro");
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleExportConversation = (format: "txt" | "md") => {
    if (messages.length === 0) {
      toast({
        title: "Cannot export empty conversation",
        variant: "destructive",
      });
      return;
    }
    const conversationName =
      conversations.find((c) => c.id === currentConversationId)?.room_name ||
      "Chat Export";
    let fileContent = "";
    const fileExtension = `.${format}`;

    if (format === "md") {
      fileContent = `# ${conversationName}\n\n`;
      messages.forEach((msg) => {
        const sender =
          msg.sender === "user" ? "User" : `AI (${msg.model || "N/A"})`;
        fileContent += `**${sender}** (${msg.timestamp.toLocaleString()}):\n\n${
          msg.content
        }\n\n---\n\n`;
      });
    } else {
      // txt format
      fileContent = `${conversationName}\n\n`;
      messages.forEach((msg) => {
        const sender =
          msg.sender === "user" ? "User" : `AI (${msg.model || "N/A"})`;
        fileContent += `[${sender} at ${msg.timestamp.toLocaleString()}]\n${
          msg.content
        }\n\n`;
      });
    }

    const blob = new Blob([fileContent], { type: `text/${format}` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${conversationName.replace(/\s+/g, "_")}${fileExtension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: `Conversation exported as ${format.toUpperCase()}` });
  };

  const loadConversations = async () => {
    try {
      const conversations = await getConversations();
      setConversations(conversations);
    } catch (error) {
      console.error("Failed to load conversations:", error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive",
      });
    }
  };

  const switchConversation = async (conversationId: number) => {
  try {
    setCurrentConversationId(conversationId);
    
    // Switch to chat tab when selecting a conversation
    setActiveTab('chat');
    
    const queries = await getConversationWithId(conversationId);
    
    // Transform and load messages
    const transformedMessages = queries.map((query: any) => ({
      id: query.id.toString(),
      content: query.result,
      sender: "ai" as const,
      timestamp: new Date(query.createdAt),
      model: query.ModelUsed?.name || "AI",
      conversationId: query.conversationId
    }));

    const queryMessages = queries.map((query: any) => ({
      id: `q-${query.id}`,
      content: query.query,
      sender: "user" as const,
      timestamp: new Date(query.createdAt),
      conversationId: query.conversationId
    }));

    const allMessages = [...queryMessages, ...transformedMessages]
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    setMessages(allMessages);
    
    toast({
      title: "Conversation loaded",
      description: `Switched to ${conversations.find(c => c.id === conversationId)?.room_name || 'conversation'}`,
    });
    
  } catch (error) {
    console.error("Failed to switch conversation:", error);
    toast({
      title: "Error",
      description: "Failed to load conversation",
      variant: "destructive",
    });
  }
};

 const createNewConversation = async () => {
  try {
    const name = `New Chat ${new Date().toLocaleString()}`;
    const newConvo = await newConversation(name, selectedModel);
    setCurrentConversationId(newConvo.conversation_id);
    setMessages([]); // Clear messages for new chat
    setActiveTab('chat'); // Switch to chat tab
    await loadConversations();
    toast({
      title: "New conversation created",
      description: "Ready to start chatting!",
    });
  } catch (error) {
    console.error("Failed to create new conversation:", error);
    toast({
      title: "Error",
      description: "Failed to create new conversation",
      variant: "destructive",
    });
  }
};

  const deleteConversation = async (conversationId: number) => {
    try {
      const resp = await deleteTheConversation(conversationId);
      // If we're deleting the current conversation, switch to a new one
      if (currentConversationId === conversationId) {
        await createNewConversation();
      }

      // Refresh conversation list
      await loadConversations();

      toast({
        title: "Conversation deleted",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete conversation",
        variant: "destructive",
      });
    }
  };

  const flattenMessageTree = (tree: MessageTree[]): Message[] => {
    const messages: Message[] = [];

    const traverse = (nodes: MessageTree[]) => {
      nodes.forEach((node) => {
        messages.push({
          id: node.id.toString(),
          content: node.content,
          sender: node.role === "user" ? "user" : "ai",
          timestamp: new Date(node.createdAt),
          model: node.role === "ai" ? "AI" : undefined,
        });

        if (node.children.length > 0) {
          traverse(node.children);
        }
      });
    };

    traverse(tree);
    return messages;
  };

  return (
    <div
      ref={containerRef}
      className="flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden mt-2"
    >
      {/* Conversation Sidebar */}
      {/* <ConversationSidebar
        conversations={conversations}
        currentConversationId={currentConversationId}
        onCreateNew={createNewConversation}
        onSwitchConversation={switchConversation}
        onDeleteConversation={deleteConversation}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      /> */}

      {/* Conversation Tree Sidebar */}
      {/* <ConversationTreeView
        messages={messages}
        isOpen={isTreeOpen}
        onToggle={() => setIsTreeOpen(!isTreeOpen)}
        onExport={handleExportConversation}
      /> */}

      {/* Main Chat Container */}
      <div className="flex-1 flex flex-col relative mb-4">
        {/* Chat Header */}
        <ChatHeader
          conversations={conversations}
          currentConversationId={currentConversationId}
          currentUser={currentUser}
          isBackendHealthy={isBackendHealthy}
          selectedModel={selectedModel}
          activeTab={activeTab}
          messages={messages}
          headerOpacity={headerOpacity}
          headerBlur={headerBlur}
          onTreeToggle={() => setIsTreeOpen(!isTreeOpen)}
          onModelSelect={(model: string) =>
            setSelectedModel(model as ModelType)
          }
          onTabChange={setActiveTab}
          onHealthCheck={() => checkBackendHealth().then(setIsBackendHealthy)}
          getModelDisplayName={getModelDisplayName}
        />

        {/* Messages Area */}
              <div
        ref={messagesRef}
        className="chat-main flex-1 overflow-y-auto relative scroll-smooth mt-[180px] mb-[140px]"
        style={{
          scrollBehavior: "smooth",
          height: "calc(100vh - 320px)",
        }}
      >
        <div className="max-w-6xl mx-auto p-6 mb-4">
          <AnimatePresence mode="sync">
            {activeTab === 'chat' && (
              <motion.div
                key="chat-content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {messages.length === 0 ? (
                  <EmptyState
                    isBackendHealthy={isBackendHealthy}
                    onSuggestionClick={setInputValue}
                  />
                ) : (
                  <div className="space-y-8">
                    {messages.map((message, index) => (
                      <MessageBubble
                        key={message.id}
                        message={message}
                        index={index}
                        onReaction={handleReaction}
                        onRetry={handleRetryMessage}
                        getModelDisplayName={getModelDisplayName}
                      />
                    ))}

                    <TypingIndicator
                      isTyping={isTyping}
                      modelName={getModelDisplayName(selectedModel)}
                    />
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'conversation tree' && (
              <motion.div
                key="tree-content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                {/* Updated ConversationTreeView */}
                <ConversationTreeView
                  messages={processedMessages}
                  onMessageSelect={(messageId) => {
                    console.log('Selected message:', messageId);
                    // Optional: Add message selection logic
                  }}
                  onNodeExpand={(nodeId) => {
                    console.log('Expanded node:', nodeId);
                    // Optional: Track node expansion
                  }}
                  onBranchToggle={(branchId) => {
                    console.log('Toggled branch:', branchId);
                    // Optional: Handle branch filtering
                  }}
                />
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div
                key="history-content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                 <HistoryView
                      conversations={conversations}
                      currentConversationId={currentConversationId}
                      onSwitchConversation={switchConversation}
                      onDeleteConversation={deleteConversation}
                      onCreateNew={createNewConversation}
                      onTabChange={setActiveTab}
                    />
                </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Chat Input - Only show for chat tab */}
      {activeTab === 'chat' && (
        <ChatInput
          inputValue={inputValue}
          attachedFiles={attachedFiles}
          selectedEmotion={selectedEmotion}
          showQuickActions={showQuickActions}
          isBackendHealthy={isBackendHealthy}
          currentUser={currentUser}
          isTyping={isTyping}
          webSearchEnabled={webSearchEnabled}
          onInputChange={setInputValue}
          onSendMessage={handleSendMessage}
          onFileUpload={handleFileUpload}
          onRemoveFile={removeFile}
          onEmotionSelect={setSelectedEmotion}
          onToggleQuickActions={() => setShowQuickActions(!showQuickActions)}
          onToggleWebSearch={() => setWebSearchEnabled(!webSearchEnabled)}
          onKeyPress={handleKeyPress}
        />
      )}

      </div>
    </div>
  );
};

export default ChatInterface;
