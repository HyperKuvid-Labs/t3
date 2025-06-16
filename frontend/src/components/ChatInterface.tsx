"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
// import { gsap } from "gsap" // Assuming GSAP is still used for animations
// import { useGSAP } from "@gsap/react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"
import {
  Send, Paperclip, X, Bot, User, ThumbsUp, ThumbsDown, RotateCcw, Sparkles, Zap,
  Settings, Copy, MessageSquare, Clock, CheckCircle2, Circle, Mic, FileText, MoreHorizontal,
  Star, Heart, Smile, AlertTriangle, Wifi, WifiOff, RefreshCw, Shield, Database, Terminal,
  Search, Plus, Trash2, Menu, TreePine, Eye, EyeOff, ChevronLeft, ChevronRight, Download,
  Save, UserPlus, ChevronDown, FileArchive,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
  DialogTrigger, DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import ChatTabs from "./ChatTabs"
import EmotionTokenPanel from "./EmotionTokenPanel"
import ConversationTree from "./ConversationTree"
import ConversationSidebar from "./ConversationSidebar"
import {
  checkBackendHealth, getCurrentUser, type ModelType,
  sendConversationInvitation, type SendInvitationRequest,
  getAvailableModels, type Model as ApiModel,
  updateConversationSettings, type ConversationDetails as ApiConversationDetails,
  createMessageWithAttachments, type MessageRequestData, type BackendMessageCreationResponse,
  type MessageFromBackend,
  createNewConversationRoom // Import the new service function
} from "@/api/chatService"

const API_BASE_URL = 'http://localhost:8000';

interface Message {
  id: string;
  backendId?: number;
  content: string;
  sender: "user" | "ai";
  model?: string;
  emotion?: string;
  attachments?: File[];
  attachmentsJson?: string | null;
  timestamp: Date;
  reactions?: { thumbsUp: boolean; thumbsDown: boolean };
  status?: "sending" | "sent" | "delivered" | "read" | "error";
  error?: string;
  parentMessageId?: string | null;
  conversationId?: number;
}

interface ChatUser {
  id: number; // Changed to number to match backend User model more closely
  username: string; // 'name' field from backend User model
  email: string;
}

interface Conversation {
  id: number;
  room_name: string;
  last_message_at: string;
  last_message?: string;
  ai_model: string | null;
  type: string;
  aiEnabled: boolean;
  users?: Array<{ id: number; name?: string; email: string; }>;
}

export interface MessageTreeNode {
  id: number;
  content: string;
  role: 'user' | 'assistant' | 'system';
  messageType: string;
  isEdited: boolean;
  originalContent?: string | null;
  editReason?: string | null;
  createdAt: string;
  user?: { id: number; name?: string; email?: string };
  model?: ApiModel | null;
  attachmentsJson?: string | null;
  children: MessageTreeNode[];
}


const MarkdownComponents = { /* ... (implementation from previous steps) ... */ };

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeConversationTree, setActiveConversationTree] = useState<MessageTreeNode[] | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [selectedGlobalModel, setSelectedGlobalModel] = useState<ModelType>("gemini-2.5-pro");
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isTreeOpen, setIsTreeOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentUser, setCurrentUser] = useState<ChatUser | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [availableModels, setAvailableModels] = useState<ApiModel[]>([]);
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [isSendingInvitation, setIsSendingInvitation] = useState(false);
  const [refreshConversationListKey, setRefreshConversationListKey] = useState(0);
  const [isBackendHealthy, setIsBackendHealthy] = useState(true);
  const [activeTab, setActiveTab] = useState("chat");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const messagesRef = useRef<HTMLDivElement>(null);
  // const { scrollYProgress } = useScroll({ container: messagesRef, offset: ["start start", "end end"]});
  // const headerOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0.95]);
  // const headerBlur = useTransform(scrollYProgress, [0, 0.1], [0, 8]);
  // GSAP usage is commented out as useGSAP is not imported. If needed, ensure import.
  // useGSAP(() => { /* GSAP Animations */ }, { scope: containerRef });


  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getCurrentUser();
        // Assuming getCurrentUser returns object matching ChatUser or needs mapping
        setCurrentUser({
          id: userData.id, // Ensure these fields match actual response
          username: userData.name || userData.username, // Backend might use 'name'
          email: userData.email,
        });
      } catch (e) { console.error(e);}
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchM = async () => {
      try {
        const m = await getAvailableModels();
        if(Array.isArray(m)) setAvailableModels(m.filter(i => i.isActive));
        else setAvailableModels([]);
      } catch (e) { console.error(e);}
    };
    fetchM();
  }, []);

  useEffect(() => { /* Backend health check (simplified) */
    checkBackendHealth().then(setIsBackendHealthy);
  }, []);

  const loadConversations = useCallback(async () => {
    if (!currentUser) return;
    try {
      const token = localStorage.getItem("authToken") || "";
      const response = await fetch(`${API_BASE_URL}/conversations`, { headers: { 'Authorization': `Bearer ${token}` }});
      if (!response.ok) throw new Error("Failed to fetch conversations");
      const convosData: ApiConversationDetails[] = await response.json();
      const mappedConversations = convosData.map(conv => ({
          id: conv.id, room_name: conv.roomName,
          last_message_at: conv.updatedAt, // Using updatedAt as last_message_at
          ai_model: conv.aiModel, type: conv.type, aiEnabled: conv.aiEnabled, users: conv.users,
      }));
      setConversations(mappedConversations);
      // If no conversation is selected and list is not empty, select the first one.
      if (currentConversationId === null && mappedConversations.length > 0) {
         switchConversation(mappedConversations[0].id);
      } else if (mappedConversations.length === 0) {
        setCurrentConversationId(null);
        setMessages([]);
        setActiveConversationTree(null);
      }
    } catch (error) { console.error('Failed to load conversations:', error); toast({title: "Error", description: "Could not load conversations.", variant: "destructive"});}
  }, [refreshConversationListKey, currentUser]); // switchConversation removed from dep array to avoid loop

  useEffect(() => { loadConversations(); }, [loadConversations]);

  const flattenTreeToMessages = (nodes: MessageTreeNode[]): Message[] => { /* ... (as before) ... */ return [];};

  const switchConversation = useCallback(async (conversationId: number) => {
    setCurrentConversationId(conversationId);
    setActiveConversationTree(null);
    setMessages([]);
    try {
      const token = localStorage.getItem("authToken") || "";
      const response = await fetch(`${API_BASE_URL}/conversation/${conversationId}/tree`, { headers: { 'Authorization': `Bearer ${token}` }});
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({detail: "Failed to fetch conversation details"}));
        throw new Error(errorData.detail || "Failed to fetch conversation details");
      }
      const convDetails: ApiConversationDetails & { messageTree: MessageTreeNode[] } = await response.json();

      setConversations(prevConvs => prevConvs.map(pc => pc.id === conversationId ? {
        ...pc, room_name: convDetails.roomName, aiEnabled: convDetails.aiEnabled,
        ai_model: convDetails.aiModel, type: convDetails.type, users: convDetails.users,
        last_message_at: convDetails.updatedAt,
      } : pc));

      setActiveConversationTree(convDetails.messageTree || []);
      setMessages(flattenTreeToMessages(convDetails.messageTree || []));
    } catch (error: any) {
      console.error('Failed to switch conversation:', error);
      toast({ title: "Error switching conversation", description: error.message, variant: "destructive" });
      setMessages([]);
      setActiveConversationTree([]);
    }
  }, []);

  const getModelDisplayName = (modelIdentifier?: string | null): string => { /* ... (as before) ... */ return "N/A"; };

  const handleSendMessage = useCallback(async () => { /* ... (as before, uses createMessageWithAttachments) ... */ },
    [inputValue, attachedFiles, currentUser, isBackendHealthy, selectedGlobalModel, currentConversationId, conversations] // Removed selectedEmotion, messages, currentConversation from deps for stability, check if needed
  );

  const handleConversationSettingsUpdate = async (modelId: number | null, enabled: boolean) => { /* ... (as before) ... */ };
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => { /* ... (as before) ... */ };
  const removeFile = (index: number) => setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  const getFileType = (filename: string): string => { /* ... (as before) ... */ return 'generic'; };

  const createNewConversation = async () => {
    if (!currentUser) {
      toast({ title: "Login Required", description: "Please log in to create a new conversation.", variant: "destructive" });
      return;
    }
    const newChatName = `New Chat ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    try {
      const newConversationDetails = await createNewConversationRoom(newChatName, 'team'); // Default type or choose one
      
      // Map ApiConversationDetails to local Conversation type
      const newConvForState: Conversation = {
        id: newConversationDetails.id,
        room_name: newConversationDetails.roomName,
        last_message_at: newConversationDetails.updatedAt,
        ai_model: newConversationDetails.aiModel,
        type: newConversationDetails.type,
        aiEnabled: newConversationDetails.aiEnabled,
        users: newConversationDetails.users,
      };

      setConversations(prev => [newConvForState, ...prev]); // Add to top of list
      // setCurrentConversationId(newConvForState.id); // This will trigger switchConversation via useEffect
      // setMessages([]); // Clear messages for new chat
      // setActiveConversationTree(null); // Clear tree for new chat
      // The above three lines are now effectively handled by calling switchConversation:
      await switchConversation(newConvForState.id); // Switch to the new conversation

      toast({
        title: "New Conversation",
        description: `"${newConvForState.room_name}" created successfully.`,
      });
    } catch (error) {
      console.error("Failed to create new conversation:", error);
      // Toast is already handled by the service function
    }
  };

  // ... (Other UI handlers and utility functions)

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      <ConversationSidebar
        conversations={conversations} currentConversationId={currentConversationId}
        onCreateNew={createNewConversation} // Pass the updated function
        onSwitchConversation={switchConversation}
        onDeleteConversation={() => { /* ... */ }} isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onConversationJoined={() => { setRefreshConversationListKey(prevKey => prevKey + 1);
          toast({ title: "Joined Conversation", description: "List updated." });
        }}
      />
      <ConversationTree
        treeData={activeConversationTree}
        isOpen={isTreeOpen}
        onToggle={() => setIsTreeOpen(!isTreeOpen)}
        onExport={() => { /* ... */ }}
        getModelDisplayName={getModelDisplayName}
      />
      <div className="flex-1 flex flex-col relative">
        {/* Header, Messages Area, Input Area */}
        {/* ... (Ensure these parts are correctly using currentConversation, messages, etc.) ... */}
         <motion.div className="chat-header fixed z-10 w-full ..." >
            {/* ... Header content ... */}
        </motion.div>
        <div ref={messagesRef} className="chat-main ...">
            {/* ... Messages rendering ... */}
        </div>
        <motion.div className="chat-input fixed bottom-0 ...">
           {/* ... Input area ... */}
        </motion.div>
      </div>
    </div>
  );
}

export default ChatInterface;
