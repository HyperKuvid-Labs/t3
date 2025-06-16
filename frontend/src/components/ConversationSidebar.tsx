// ConversationSidebar.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Plus, MessageSquare, Trash2, ChevronLeft, ChevronRight, Mail, Check, X as IconX } from 'lucide-react'; // Added Mail, Check, IconX
import { getMyInvitations, acceptInvitation, declineInvitation, type Invitation } from '@/api/chatService'; // Import invitation services and type
import { toast } from '@/hooks/use-toast'; // For showing notifications

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
  // Add a callback to refresh conversations after joining one via invitation
  onConversationJoined: () => void;
}

const ConversationSidebar: React.FC<ConversationSidebarProps> = ({
  conversations,
  currentConversationId,
  onCreateNew,
  onSwitchConversation,
  onDeleteConversation,
  isCollapsed,
  onToggleCollapse,
  onConversationJoined
}) => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoadingInvitations, setIsLoadingInvitations] = useState(false);
  const [processingInvitationId, setProcessingInvitationId] = useState<number | null>(null);

  const fetchInvitations = async () => {
    setIsLoadingInvitations(true);
    try {
      const fetchedInvitations = await getMyInvitations();
      setInvitations(fetchedInvitations || []);
    } catch (error) {
      console.error("Failed to fetch invitations:", error);
      toast({ title: "Error", description: "Could not fetch your invitations.", variant: "destructive" });
      setInvitations([]); // Ensure it's an empty array on error
    } finally {
      setIsLoadingInvitations(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
    // Optionally, set up polling for invitations if real-time updates are desired without websockets
    // const intervalId = setInterval(fetchInvitations, 30000); // Fetch every 30 seconds
    // return () => clearInterval(intervalId);
  }, []);

  const handleAcceptInvitation = async (invitationId: number) => {
    setProcessingInvitationId(invitationId);
    try {
      await acceptInvitation(invitationId);
      toast({ title: "Invitation Accepted", description: "You've joined the conversation." });
      setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
      onConversationJoined(); // Callback to refresh conversations or switch to it
    } catch (error) {
      // Error toast is handled by the service
      console.error("Failed to accept invitation:", error);
    } finally {
      setProcessingInvitationId(null);
    }
  };

  const handleDeclineInvitation = async (invitationId: number) => {
    setProcessingInvitationId(invitationId);
    try {
      await declineInvitation(invitationId);
      toast({ title: "Invitation Declined" });
      setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
    } catch (error) {
      // Error toast is handled by the service
      console.error("Failed to decline invitation:", error);
    } finally {
      setProcessingInvitationId(null);
    }
  };

  return (
    <motion.div
      initial={false}
      animate={{ width: isCollapsed ? 60 : 280 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="bg-slate-950 border-r border-slate-800 flex flex-col relative" // Updated colors
    >
      {/* Collapse Toggle Button */}
      <Button 
        onClick={onToggleCollapse} 
        size="sm" 
        variant="ghost" 
        className="absolute -right-3 top-4 z-10 w-6 h-6 rounded-full border bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700 shadow-md" // Updated colors
      >
        {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </Button>

      {/* New Chat Button */}
      <div className="p-4 border-b border-slate-800"> {/* Updated colors */}
        {!isCollapsed ? (
          <Button 
            onClick={onCreateNew}
            className="w-full flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white" // Updated style
            variant="default"
          >
            <Plus size={16} />
            New Chat
          </Button>
        ) : (
          <Button 
            onClick={onCreateNew}
            size="icon"  // Changed size to icon for better collapsed view
            variant="default"
            className="w-full p-2 bg-purple-600 hover:bg-purple-700 text-white" // Updated style
          >
            <Plus size={16} />
          </Button>
        )}
      </div>
      
      {/* Invitations Section */}
      {!isCollapsed && invitations.length > 0 && (
        <div className="p-4 border-b border-slate-800">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Mail size={14} /> Invitations
          </h3>
          <AnimatePresence>
            {invitations.map(invite => (
              <motion.div
                key={invite.id}
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-3 mb-2 bg-slate-800/50 rounded-lg border border-slate-700"
              >
                <p className="text-sm text-slate-200 mb-1">
                  From: <span className="font-semibold">{invite.inviter?.name || invite.inviter?.email || 'Someone'}</span>
                </p>
                <p className="text-xs text-slate-400 mb-1">
                  To join: <span className="font-semibold">{invite.conversation?.roomName || 'a conversation'}</span>
                </p>
                {invite.message && (
                  <p className="text-xs text-slate-500 italic mb-2 p-2 bg-slate-700/30 rounded">"{invite.message}"</p>
                )}
                <div className="flex gap-2 mt-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleAcceptInvitation(invite.id)}
                    disabled={processingInvitationId === invite.id}
                    className="flex-1 bg-green-600/20 hover:bg-green-500/30 text-green-400 border-green-500/30 hover:border-green-500/50"
                  >
                    <Check size={14} className="mr-1" /> Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeclineInvitation(invite.id)}
                    disabled={processingInvitationId === invite.id}
                    className="flex-1 bg-red-600/20 hover:bg-red-500/30 text-red-400 border-red-500/30 hover:border-red-500/50"
                  >
                    <IconX size={14} className="mr-1" /> Decline
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.map((conversation) => (
          <motion.div 
            key={conversation.id}
            whileHover={{ backgroundColor: "rgba(128, 90, 213, 0.1)" }} // Purpleish hover
            className={`p-3 border-b border-slate-800 cursor-pointer group ${
              currentConversationId === conversation.id 
                ? 'bg-purple-600/10 border-l-4 border-l-purple-500' // Purpleish active
                : 'hover:border-l-purple-500/50 border-l-4 border-l-transparent'
            }`}
            onClick={() => onSwitchConversation(conversation.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <MessageSquare size={14} className="text-slate-400 flex-shrink-0" />
                  {!isCollapsed && (
                    <h4 className="text-sm font-medium truncate text-slate-200"> {/* Updated text color */}
                      {conversation.room_name}
                    </h4>
                  )}
                </div>
                
                {!isCollapsed && conversation.last_message && (
                  <p className="text-xs text-slate-500 truncate">
                    {conversation.last_message}
                  </p>
                )}
                
                {!isCollapsed && (
                  <p className="text-xs text-slate-500 mt-1"> {/* Updated text color */}
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
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 text-slate-400 hover:text-red-500" // Updated text color
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