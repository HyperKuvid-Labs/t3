import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    ChevronLeft, ChevronRight, Download, Save,
    MessageSquare, User, Bot, Edit3, FileText, FileArchive, CornerDownRight
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { type ApiModel } from '@/api/chatService'; // Assuming ApiModel is exported

// Interface for message nodes in the tree, should match backend structure
export interface MessageTreeNode {
  id: number;
  content: string;
  role: 'user' | 'assistant' | 'system';
  messageType: string; // Can be used for specific icons or styling
  isEdited: boolean;
  originalContent?: string | null;
  editReason?: string | null;
  createdAt: string; // ISO Date string
  user?: { id: number; name?: string; email?: string };
  model?: ApiModel | null;
  attachmentsJson?: string | null;
  children: MessageTreeNode[];
}

interface ConversationTreeProps {
  treeData: MessageTreeNode[] | null; // Hierarchical data
  isOpen: boolean;
  onToggle: () => void;
  onExport: (format: 'txt' | 'md') => void;
  getModelDisplayName: (modelIdentifier?: string | null) => string; // Pass utility from ChatInterface
  // onSelectMessage?: (messageId: number) => void; // Optional: for future interaction
}

interface AttachmentMetadata {
    filename: string;
    contentType?: string;
    size?: number;
    summary?: string;
    error?: string;
}


const getFileTypeForIcon = (filename: string = ""): string => {
    const extension = filename.split('.').pop()?.toLowerCase();
    if (extension === 'pdf') return 'pdf';
    if (['txt', 'md'].includes(extension || '')) return 'text';
    if (['png', 'jpg', 'jpeg', 'gif'].includes(extension || '')) return 'image'; // Though images might not be text-renderable in tree
    return 'generic';
};


// Recursive component to render each message node
const MessageNode: React.FC<{ node: MessageTreeNode; depth: number; getModelDisplayName: Function }> = ({ node, depth, getModelDisplayName }) => {
  const [isExpanded, setIsExpanded] = useState(true); // Default to expanded

  let attachments: AttachmentMetadata[] = [];
  if (node.attachmentsJson) {
    try {
      attachments = JSON.parse(node.attachmentsJson);
    } catch (e) {
      console.error("Failed to parse attachmentsJson for message node:", node.id, e);
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      className="mb-1"
      style={{ marginLeft: depth * 16 }} // Indentation for hierarchy
    >
      <div
        className={`p-2.5 rounded-md border transition-all duration-150 ease-in-out
                    ${node.role === 'user' ? 'bg-blue-900/30 border-blue-700/50 hover:bg-blue-900/50'
                                          : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-700/80'}`}
      >
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            {node.role === 'user' ? <User className="w-3.5 h-3.5 text-blue-400" /> : <Bot className="w-3.5 h-3.5 text-purple-400" />}
            <span className="text-xs font-semibold text-slate-300">
              {node.role === 'user' ? (node.user?.name || node.user?.email || 'User') : 'AI Assistant'}
            </span>
            {node.isEdited && <Edit3 className="w-3 h-3 text-yellow-400" title="Edited" />}
          </div>
          <span className="text-xxs text-slate-500">{new Date(node.createdAt).toLocaleTimeString()}</span>
        </div>

        <p className="text-xs text-slate-200 truncate" title={node.content}>
          {node.content.substring(0, 100)}{node.content.length > 100 ? '...' : ''}
        </p>

        {node.role === 'assistant' && node.model && (
          <Badge variant="outline" className="mt-1.5 text-xxs border-purple-500/40 text-purple-300 bg-purple-600/10 px-1.5 py-0.5">
            {getModelDisplayName(node.model.nameOnline || node.model.name)}
          </Badge>
        )}

        {attachments && attachments.length > 0 && (
            <div className="mt-1.5 pt-1 border-t border-slate-700/50">
                {attachments.map((att, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-xxs text-slate-400 my-0.5" title={att.filename}>
                        {getFileTypeForIcon(att.filename) === 'pdf' && <FileArchive className="w-3 h-3 text-red-400 flex-shrink-0" />}
                        {getFileTypeForIcon(att.filename) === 'text' && <FileText className="w-3 h-3 text-blue-400 flex-shrink-0" />}
                        {getFileTypeForIcon(att.filename) === 'generic' && <FileArchive className="w-3 h-3 text-slate-500 flex-shrink-0" />}
                        <span className="truncate">{att.filename}</span>
                        {att.error && <Badge variant="destructive" className="text-xxs px-1 py-0">Error</Badge>}
                    </div>
                ))}
            </div>
        )}

        {node.children && node.children.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="mt-1 p-0 h-auto text-slate-400 hover:text-slate-200 text-xs">
            {isExpanded ? 'Collapse' : 'Expand'} ({node.children.length}) <CornerDownRight className={`w-3 h-3 ml-1 transform transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
          </Button>
        )}
      </div>

      <AnimatePresence>
        {isExpanded && node.children && node.children.length > 0 && (
          <motion.div
            className="mt-1"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            {node.children.map(childNode => (
              <MessageNode key={childNode.id} node={childNode} depth={depth + 1} getModelDisplayName={getModelDisplayName} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};


const ConversationTree: React.FC<ConversationTreeProps> = ({ treeData, isOpen, onToggle, onExport, getModelDisplayName }) => {
  return (
    <>
      <Button
        onClick={onToggle} variant="outline" size="icon"
        className={`fixed left-3 top-1/2 -translate-y-1/2 z-40 h-8 w-8 transition-transform duration-300 ease-in-out border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300
                    ${isOpen ? 'translate-x-[20rem]' : 'translate-x-0'}`} // 20rem = 320px (width of panel)
        title={isOpen ? "Close History" : "Open History"}
      >
        {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </Button>

      <motion.div
        initial={false}
        animate={{ x: isOpen ? 0 : -320, opacity: isOpen ? 1 : 0.5 }}
        transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
        className="fixed left-0 top-0 h-full bg-slate-900/90 backdrop-blur-md border-r border-slate-700/60 z-30 w-80 shadow-2xl"
      >
        <div className="h-full flex flex-col">
          <div className="p-3.5 border-b border-slate-700/60">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-purple-400"/>
                Conversation History
              </h3>
              <div className="flex gap-0.5">
                <Button onClick={() => onExport('md')} variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-white" title="Export as Markdown"><Download className="w-3.5 h-3.5" /></Button>
                <Button onClick={() => onExport('txt')} variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-white" title="Export as Text"><Save className="w-3.5 h-3.5" /></Button>
              </div>
            </div>
            {treeData && treeData.length > 0 && <Badge variant="secondary" className="text-xxs">{treeData.reduce((acc, curr) => acc + 1 + (curr.children?.length || 0), 0)} messages</Badge>}
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {!treeData || treeData.length === 0 ? (
              <motion.div className="text-center py-10 text-slate-500" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-xs">No conversation loaded or history is empty.</p>
              </motion.div>
            ) : (
              treeData.map(rootNode => (
                <MessageNode key={rootNode.id} node={rootNode} depth={0} getModelDisplayName={getModelDisplayName} />
              ))
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default ConversationTree;