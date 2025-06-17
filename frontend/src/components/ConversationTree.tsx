import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import {
  MessageSquare,
  Bot,
  User,
  GitBranch,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Clock,
  Search,
  Filter,
  RotateCcw,
  Maximize2,
  Download,
  Share2,
  Eye,
  EyeOff,
} from "lucide-react";

// Enhanced interfaces
interface TreeNode {
  id: string;
  content: string;
  sender: "user" | "ai";
  model?: string;
  timestamp: Date;
  parentId?: string;
  children: TreeNode[];
  isExpanded: boolean;
  branchPoint: boolean;
  depth: number;
  branchId?: string;
  messageIndex: number;
  reactions?: string[];
  isVisible: boolean;
  searchMatch?: boolean;
}

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  model?: string;
  timestamp: Date;
  parentId?: string;
  branchId?: string;
  modelSwitched?: boolean;
  reactions?: {
    thumbsUp: boolean;
    thumbsDown: boolean;
  };
  metadata?: {
    tokens?: number;
    processingTime?: number;
    confidence?: number;
  };
}

interface ConversationBranch {
  id: string;
  name: string;
  model: string;
  nodeCount: number;
  color: string;
  isVisible: boolean;
}

interface TreeStats {
  totalNodes: number;
  totalBranches: number;
  maxDepth: number;
  modelDistribution: Record<string, number>;
}

interface ConversationTreeViewProps {
  messages: Message[];
  onMessageSelect: (messageId: string) => void;
  onNodeExpand?: (nodeId: string) => void;
  onBranchToggle?: (branchId: string) => void;
  className?: string;
}

const ConversationTreeView = ({
  messages,
  onMessageSelect,
  onNodeExpand,
  onBranchToggle,
  className = "",
}: ConversationTreeViewProps) => {
  // State management
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredBranches, setFilteredBranches] = useState<Set<string>>(
    new Set()
  );
  const [branches, setBranches] = useState<ConversationBranch[]>([]);
  const [stats, setStats] = useState<TreeStats>({
    totalNodes: 0,
    totalBranches: 0,
    maxDepth: 0,
    modelDistribution: {},
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewMode, setViewMode] = useState<"tree" | "timeline" | "compact">(
    "tree"
  );

  // Refs
  const treeRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Color palette for branches
  const branchColors = [
    "from-blue-500 to-cyan-500",
    "from-purple-500 to-pink-500",
    "from-green-500 to-emerald-500",
    "from-orange-500 to-red-500",
    "from-indigo-500 to-purple-500",
    "from-teal-500 to-blue-500",
    "from-rose-500 to-pink-500",
    "from-amber-500 to-orange-500",
  ];

  // Build tree structure from messages
  const buildTreeStructure = useCallback((messages: Message[]) => {
    const nodeMap = new Map<string, TreeNode>();
    const rootNodes: TreeNode[] = [];
    const branchMap = new Map<string, ConversationBranch>();
    let currentModel: string | undefined;
    let branchCounter = 0;

    // Process messages into nodes
    messages.forEach((message, index) => {
      const isModelSwitch = message.model && message.model !== currentModel;
      const branchId = isModelSwitch
        ? `branch-${branchCounter++}`
        : index > 0
        ? messages[index - 1].branchId || "main"
        : "main";

      if (isModelSwitch) {
        currentModel = message.model;

        // Create branch info
        if (!branchMap.has(branchId)) {
          branchMap.set(branchId, {
            id: branchId,
            name: `${message.model} Branch`,
            model: message.model || "Unknown",
            nodeCount: 0,
            color: branchColors[branchCounter % branchColors.length],
            isVisible: true,
          });
        }
      }

      const reactions = [];
      if (message.reactions) {
        if (message.reactions.thumbsUp) reactions.push("👍");
        if (message.reactions.thumbsDown) reactions.push("👎");
      }

      const node: TreeNode = {
        id: message.id,
        content: message.content,
        sender: message.sender,
        model: message.model,
        timestamp: message.timestamp,
        parentId: index > 0 ? messages[index - 1].id : undefined,
        children: [],
        isExpanded: true,
        branchPoint: isModelSwitch,
        depth: 0,
        branchId,
        messageIndex: index,
        isVisible: true,
        searchMatch: false,
      };

      nodeMap.set(message.id, node);

      // Update branch node count
      const branch = branchMap.get(branchId);
      if (branch) {
        branch.nodeCount++;
      }
    });

    // Build parent-child relationships and calculate depths
    nodeMap.forEach((node) => {
      if (node.parentId && nodeMap.has(node.parentId)) {
        const parent = nodeMap.get(node.parentId)!;
        parent.children.push(node);
        node.depth = parent.depth + 1;
      } else {
        rootNodes.push(node);
      }
    });

    // Calculate statistics
    const modelDist: Record<string, number> = {};
    let maxDepth = 0;

    const calculateStats = (nodes: TreeNode[]) => {
      nodes.forEach((node) => {
        if (node.model) {
          modelDist[node.model] = (modelDist[node.model] || 0) + 1;
        }
        maxDepth = Math.max(maxDepth, node.depth);
        calculateStats(node.children);
      });
    };

    calculateStats(rootNodes);

    setStats({
      totalNodes: nodeMap.size,
      totalBranches: branchMap.size,
      maxDepth,
      modelDistribution: modelDist,
    });

    setBranches(Array.from(branchMap.values()));
    return rootNodes;
  }, []);

  // Search functionality
  const performSearch = useCallback(
    (query: string, nodes: TreeNode[]): TreeNode[] => {
      if (!query.trim()) {
        return nodes.map((node) => ({
          ...node,
          searchMatch: false,
          children: performSearch(query, node.children),
        }));
      }

      const searchLower = query.toLowerCase();

      return nodes.map((node) => {
        const contentMatch = node.content.toLowerCase().includes(searchLower);
        const modelMatch = node.model?.toLowerCase().includes(searchLower);
        const isMatch = contentMatch || modelMatch;

        return {
          ...node,
          searchMatch: isMatch,
          children: performSearch(query, node.children),
        };
      });
    },
    []
  );

  // Filter by branches
  const filterByBranches = useCallback(
    (nodes: TreeNode[]): TreeNode[] => {
      if (filteredBranches.size === 0) {
        return nodes.map((node) => ({
          ...node,
          isVisible: true,
          children: filterByBranches(node.children),
        }));
      }

      return nodes.map((node) => ({
        ...node,
        isVisible: !node.branchId || filteredBranches.has(node.branchId),
        children: filterByBranches(node.children),
      }));
    },
    [filteredBranches]
  );

  // Initialize tree data
  useEffect(() => {
    const tree = buildTreeStructure(messages);
    const searchFiltered = performSearch(searchQuery, tree);
    const branchFiltered = filterByBranches(searchFiltered);
    setTreeData(branchFiltered);
  }, [
    messages,
    searchQuery,
    filteredBranches,
    buildTreeStructure,
    performSearch,
    filterByBranches,
  ]);

  // GSAP entrance animation
  useEffect(() => {
    if (treeRef.current && treeData.length > 0) {
      gsap.fromTo(
        treeRef.current.children,
        {
          opacity: 0,
          x: -50,
          scale: 0.9,
        },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
        }
      );
    }
  }, [treeData]);

  // Node interactions
  const toggleNode = useCallback(
    (nodeId: string) => {
      const updateNode = (nodes: TreeNode[]): TreeNode[] => {
        return nodes.map((node) => {
          if (node.id === nodeId) {
            return { ...node, isExpanded: !node.isExpanded };
          }
          if (node.children.length > 0) {
            return { ...node, children: updateNode(node.children) };
          }
          return node;
        });
      };

      setTreeData(updateNode(treeData));
      onNodeExpand?.(nodeId);
    },
    [treeData, onNodeExpand]
  );

  const handleNodeClick = useCallback(
    (nodeId: string) => {
      setSelectedNode(nodeId);
      onMessageSelect(nodeId);
    },
    [onMessageSelect]
  );

  const toggleBranch = useCallback(
    (branchId: string) => {
      setFilteredBranches((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(branchId)) {
          newSet.delete(branchId);
        } else {
          newSet.add(branchId);
        }
        return newSet;
      });
      onBranchToggle?.(branchId);
    },
    [onBranchToggle]
  );

  const expandAll = useCallback(() => {
    const expandNodes = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.map((node) => ({
        ...node,
        isExpanded: true,
        children: expandNodes(node.children),
      }));
    };
    setTreeData(expandNodes(treeData));
  }, [treeData]);

  const collapseAll = useCallback(() => {
    const collapseNodes = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.map((node) => ({
        ...node,
        isExpanded: false,
        children: collapseNodes(node.children),
      }));
    };
    setTreeData(collapseNodes(treeData));
  }, [treeData]);

  return (
    <div
      className={`h-full flex flex-col bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 ${className}`}
    >
      {/* Enhanced Header */}
      <motion.div
        className="flex-shrink-0 p-6 border-b border-zinc-700/50 bg-zinc-800/50 backdrop-blur-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 rounded-lg">
              <GitBranch className="w-5 h-5 text-neon-blue" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                Conversation Tree
              </h2>
              <p className="text-sm text-zinc-400">
                {stats.totalNodes} messages • {stats.totalBranches} branches •{" "}
                {stats.maxDepth} levels deep
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <motion.button
              onClick={expandAll}
              className="p-2 bg-zinc-700/50 hover:bg-zinc-600/50 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronDown className="w-4 h-4 text-zinc-300" />
            </motion.button>

            <motion.button
              onClick={collapseAll}
              className="p-2 bg-zinc-700/50 hover:bg-zinc-600/50 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronRight className="w-4 h-4 text-zinc-300" />
            </motion.button>

            <motion.button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 bg-zinc-700/50 hover:bg-zinc-600/50 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Maximize2 className="w-4 h-4 text-zinc-300" />
            </motion.button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search messages, models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-700/50 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-neon-blue/50 focus:ring-1 focus:ring-neon-blue/20"
            />
          </div>

          {/* Branch Filter */}
          <div className="flex items-center gap-2">
            {branches.map((branch) => (
              <motion.button
                key={branch.id}
                onClick={() => toggleBranch(branch.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  filteredBranches.has(branch.id)
                    ? "bg-zinc-600 text-zinc-300"
                    : `bg-gradient-to-r ${branch.color} text-white shadow-lg`
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {branch.model} ({branch.nodeCount})
              </motion.button>
            ))}
          </div>
        </div>

        {/* Stats Bar */}
        <div className="mt-4 flex items-center gap-6 text-sm text-zinc-400">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            <span>{stats.totalNodes} Messages</span>
          </div>
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4" />
            <span>{stats.totalBranches} Branches</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>{Object.keys(stats.modelDistribution).length} Models</span>
          </div>
        </div>
      </motion.div>

      {/* Tree Container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto overflow-x-auto"
      >
        <div
          ref={treeRef}
          className="p-6 min-w-full"
          style={{ minHeight: "calc(100vh - 300px)" }}
        >
          <AnimatePresence mode="popLayout">
            {treeData.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center h-64 text-zinc-400"
              >
                <div className="text-center">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No messages to display</p>
                </div>
              </motion.div>
            ) : (
              treeData.map((node, index) => (
                <TreeNodeComponent
                  key={node.id}
                  node={node}
                  isSelected={selectedNode === node.id}
                  onToggle={toggleNode}
                  onClick={handleNodeClick}
                  index={index}
                  searchQuery={searchQuery}
                />
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

interface TreeNodeComponentProps {
  node: TreeNode;
  isSelected: boolean;
  onToggle: (nodeId: string) => void;
  onClick: (nodeId: string) => void;
  index: number;
  searchQuery: string;
}

const TreeNodeComponent = ({
  node,
  isSelected,
  onToggle,
  onClick,
  index,
  searchQuery,
}: TreeNodeComponentProps) => {
  const nodeRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);

  // Advanced GSAP animations
  useEffect(() => {
    const element = nodeRef.current;
    if (!element) return;

    const tl = gsap.timeline({ paused: true });

    tl.to(element, {
      scale: 1.02,
      y: -2,
      duration: 0.3,
      ease: "power2.out",
    }).to(
      element.querySelector(".node-glow"),
      {
        opacity: 0.6,
        duration: 0.2,
      },
      0
    );

    const handleMouseEnter = () => {
      setIsHovered(true);
      tl.play();
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
      tl.reverse();
    };

    element.addEventListener("mouseenter", handleMouseEnter);
    element.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      element.removeEventListener("mouseenter", handleMouseEnter);
      element.removeEventListener("mouseleave", handleMouseLeave);
      tl.kill();
    };
  }, []);

  // Highlight search matches
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;

    const regex = new RegExp(`(${query})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-400/30 text-yellow-200 rounded px-1">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const nodeVariants = {
    hidden: {
      opacity: 0,
      x: -30,
      scale: 0.9,
      rotateY: -15,
    },
    visible: {
      opacity: node.isVisible ? 1 : 0.3,
      x: 0,
      scale: 1,
      rotateY: 0,
      transition: {
        duration: 0.5,
        delay: index * 0.05,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      x: -30,
      scale: 0.9,
      transition: { duration: 0.3 },
    },
  };

  const childrenVariants = {
    hidden: {
      height: 0,
      opacity: 0,
      scale: 0.95,
    },
    visible: {
      height: "auto",
      opacity: 1,
      scale: 1,
      transition: {
        height: { duration: 0.4, ease: "easeOut" },
        opacity: { duration: 0.3, delay: 0.1 },
        scale: { duration: 0.3, delay: 0.1 },
      },
    },
  };

  if (!node.isVisible) return null;

  return (
    <motion.div
      ref={nodeRef}
      variants={nodeVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="relative mb-3"
      style={{
        marginLeft: `${node.depth * 40}px`,
        perspective: "1000px",
      }}
    >
      {/* Connection Lines */}
      {node.depth > 0 && (
        <>
          <div className="absolute -left-5 top-8 w-5 h-px bg-gradient-to-r from-zinc-600 to-transparent" />
          <div className="absolute -left-5 top-0 w-px h-8 bg-gradient-to-b from-zinc-600 to-transparent" />
        </>
      )}

      {/* Branch Point Indicator */}
      {node.branchPoint && (
        <motion.div
          className="absolute -left-8 top-6 w-4 h-4 rounded-full bg-gradient-to-r from-neon-purple to-pink-500 shadow-lg"
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, 180, 360],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-neon-purple to-pink-500 animate-ping opacity-30" />
        </motion.div>
      )}

      {/* Main Node Container */}
      <motion.div
        className={`relative group cursor-pointer ${
          isSelected ? "z-10" : "z-0"
        }`}
        onClick={() => onClick(node.id)}
        whileHover={{
          boxShadow: isSelected
            ? "0 0 40px rgba(0, 191, 255, 0.4)"
            : "0 0 25px rgba(255, 255, 255, 0.1)",
        }}
      >
        {/* Glow Effect */}
        <div
          className={`node-glow absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 ${
            isSelected
              ? "bg-gradient-to-r from-neon-blue/20 to-neon-purple/20"
              : "bg-gradient-to-r from-white/5 to-white/10"
          }`}
        />

        {/* Node Content */}
        <div
          className={`relative p-4 rounded-xl border backdrop-blur-sm transition-all duration-300 ${
            isSelected
              ? "bg-gradient-to-r from-neon-blue/10 to-neon-purple/10 border-neon-blue shadow-2xl shadow-neon-blue/20"
              : node.searchMatch
              ? "bg-yellow-500/10 border-yellow-500/50 shadow-lg shadow-yellow-500/10"
              : "bg-zinc-800/60 border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800/80"
          }`}
        >
          {/* Node Header */}
          <div className="flex items-start gap-3">
            {/* Expand/Collapse Button */}
            {node.children.length > 0 && (
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle(node.id);
                }}
                className="mt-1 p-1.5 rounded-md hover:bg-zinc-700/50 transition-colors group"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <motion.div
                  animate={{ rotate: node.isExpanded ? 90 : 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-white" />
                </motion.div>
              </motion.button>
            )}

            {/* Sender Avatar */}
            <motion.div
              className={`p-2.5 rounded-lg ${
                node.sender === "user"
                  ? "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300"
                  : "bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300"
              }`}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.2 }}
            >
              {node.sender === "user" ? (
                <User className="w-4 h-4" />
              ) : (
                <Bot className="w-4 h-4" />
              )}
            </motion.div>

            {/* Content Area */}
            <div className="flex-1 min-w-0">
              {/* Metadata Row */}
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <motion.span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    node.sender === "user"
                      ? "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300"
                      : "bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300"
                  }`}
                  whileHover={{ scale: 1.05 }}
                >
                  {node.sender === "user" ? "User" : "AI Assistant"}
                </motion.span>

                {node.model && (
                  <motion.span
                    className="text-xs bg-gradient-to-r from-zinc-700 to-zinc-600 text-zinc-300 px-2.5 py-1 rounded-full font-medium"
                    whileHover={{ scale: 1.05 }}
                  >
                    {node.model}
                  </motion.span>
                )}

                {node.branchPoint && (
                  <motion.div
                    className="flex items-center gap-1 text-xs bg-gradient-to-r from-neon-purple/20 to-pink-500/20 text-neon-purple px-2.5 py-1 rounded-full font-medium"
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <GitBranch className="w-3 h-3" />
                    New Branch
                  </motion.div>
                )}

                <div className="flex items-center gap-1 text-xs text-zinc-500 ml-auto">
                  <Clock className="w-3 h-3" />
                  {node.timestamp.toLocaleTimeString()}
                </div>
              </div>

              {/* Message Content */}
              <div className="relative">
                <p
                  className={`text-white text-sm leading-relaxed ${
                    showFullContent ? "" : "line-clamp-3"
                  }`}
                >
                  {highlightText(node.content, searchQuery)}
                </p>

                {node.content.length > 150 && (
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowFullContent(!showFullContent);
                    }}
                    className="mt-2 text-xs text-neon-blue hover:text-neon-purple transition-colors"
                    whileHover={{ scale: 1.05 }}
                  >
                    {showFullContent ? "Show less" : "Show more"}
                  </motion.button>
                )}
              </div>

              {/* Reactions */}
              {node.reactions && node.reactions.length > 0 && (
                <div className="flex items-center gap-1 mt-3">
                  {node.reactions.map((reaction, i) => (
                    <motion.span
                      key={i}
                      className="text-sm bg-zinc-700/50 px-2 py-1 rounded-full"
                      whileHover={{ scale: 1.1 }}
                    >
                      {reaction}
                    </motion.span>
                  ))}
                </div>
              )}

              {/* Node Actions */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    className="absolute top-2 right-2 flex items-center gap-1"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.button
                      className="p-1.5 bg-zinc-700/80 hover:bg-zinc-600 rounded-md transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Share2 className="w-3 h-3 text-zinc-300" />
                    </motion.button>

                    <motion.button
                      className="p-1.5 bg-zinc-700/80 hover:bg-zinc-600 rounded-md transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Download className="w-3 h-3 text-zinc-300" />
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Selection Indicator */}
          {isSelected && (
            <motion.div
              className="absolute inset-0 rounded-xl border-2 border-neon-blue pointer-events-none"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </div>
      </motion.div>

      {/* Children Nodes */}
      <AnimatePresence>
        {node.isExpanded && node.children.length > 0 && (
          <motion.div
            variants={childrenVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-3">
              {node.children.map((child, childIndex) => (
                <TreeNodeComponent
                  key={child.id}
                  node={child}
                  isSelected={isSelected}
                  onToggle={onToggle}
                  onClick={onClick}
                  index={childIndex}
                  searchQuery={searchQuery}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const processMessagesForTree = (messages: Message[]): Message[] => {
  let currentModel: string | undefined;
  let branchCounter = 0;

  return messages.map((message, index) => {
    const isModelSwitch = message.model && message.model !== currentModel;

    if (isModelSwitch) {
      currentModel = message.model;
      branchCounter++;
    }

    return {
      ...message,
      modelSwitched: isModelSwitch && index > 0,
      parentId: index > 0 ? messages[index - 1].id : undefined,
      branchId: isModelSwitch
        ? `branch-${branchCounter}`
        : index > 0
        ? messages[index - 1].branchId || "main"
        : "main",
    };
  });
};

export default ConversationTreeView;
