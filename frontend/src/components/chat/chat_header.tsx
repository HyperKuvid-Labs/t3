"use client"

import React, { useState, useEffect } from "react"
import { motion, useReducedMotion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Bot, 
  MessageSquare, 
  Wifi, 
  WifiOff, 
  Database, 
  Settings, 
  Shield, 
  Clock,
  Users,
  Activity,
  Sparkles,
  ChevronDown,
  MoreHorizontal
} from 'lucide-react'
import ModelSelector from "../ModelSelector"
import ChatTabs from "../ChatTabs"

interface ChatUser {
  id: string
  username: string
  email: string
}

interface Conversation {
  id: number
  room_name: string
  last_message_at: string
  last_message?: string
  ai_model: string
  type: string
  aiEnabled: boolean
}

interface ChatHeaderProps {
  conversations: Conversation[]
  currentConversationId: number | null
  currentUser: ChatUser | null
  isBackendHealthy: boolean
  selectedModel: string
  activeTab: string
  messages: any[]
  headerOpacity: any
  headerBlur: any
  onTreeToggle: () => void
  onModelSelect: (model: string) => void
  onTabChange: (tab: string) => void
  onHealthCheck: () => void
  getModelDisplayName: (model: string) => string
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  conversations,
  currentConversationId,
  currentUser,
  isBackendHealthy,
  selectedModel,
  activeTab,
  messages,
  headerOpacity,
  headerBlur,
  onTreeToggle,
  onModelSelect,
  onTabChange,
  onHealthCheck,
  getModelDisplayName
}) => {
  const [showStats, setShowStats] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const shouldReduceMotion = useReducedMotion()

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const currentConversation = conversations.find((c) => c.id === currentConversationId)
  const activeUsers = conversations.filter(c => c.aiEnabled).length

  const containerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  }

  return (
    <motion.div
      className="chat-header fixed top-0 left-0 right-0 z-50 border-b border-zinc-800/30 backdrop-blur-2xl mt-20 mb-5"
      style={{
        opacity: headerOpacity,
        backdropFilter: `blur(${headerBlur}px)`,
      }}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Enhanced Background with Gradient Mesh */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-zinc-900/95" />
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/10 via-transparent to-blue-900/10" />
      
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative max-w-8xl mx-auto px-6 py-4">
        {/* Main Header Section */}
        <div className="flex items-center justify-between mb-6">
          {/* Left Section - Brand & Navigation */}
          <motion.div
            className="flex items-center gap-6"
            variants={itemVariants}
          >
            {/* Enhanced Toggle Button */}
            <Button
              onClick={onTreeToggle}
              variant="outline"
              size="lg"
              className="group relative border-zinc-700/50 hover:border-purple-500/50 bg-zinc-800/40 hover:bg-zinc-700/60 transition-all duration-300 backdrop-blur-sm h-12 px-4"
            >
              <MessageSquare className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Button>

            {/* Enhanced Brand Section */}
            <div className="flex items-center gap-4">
              <motion.div
                className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 flex items-center justify-center shadow-2xl shadow-purple-500/30"
                whileHover={shouldReduceMotion ? {} : { scale: 1.05, rotate: 5 }}
                whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
              >
                <Bot className="w-7 h-7 text-white" />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent" />
                
                {/* Activity Indicator */}
                {isBackendHealthy && (
                  <motion.div
                    className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-slate-900"
                    animate={shouldReduceMotion ? {} : { scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.div>

              <div className="space-y-1">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent tracking-tight leading-tight">
                  {currentConversation?.room_name || "AI Chat Studio"}
                </h1>
                
                {/* Enhanced Status Bar */}
                <div className="flex items-center gap-3 text-sm">
                  <motion.div 
                    className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800/50 border border-zinc-700/50"
                    whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        isBackendHealthy
                          ? "bg-green-400 shadow-lg shadow-green-400/50"
                          : "bg-red-400 shadow-lg shadow-red-400/50"
                      }`}
                    />
                    <span className={isBackendHealthy ? "text-green-300" : "text-red-300"}>
                      {isBackendHealthy ? "Online" : "Offline"}
                    </span>
                  </motion.div>

                  {currentUser && (
                    <motion.div 
                      className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800/50 border border-zinc-700/50"
                      whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
                    >
                      <Shield className="w-3 h-3 text-blue-400" />
                      <span className="text-zinc-300 font-medium">{currentUser.username}</span>
                    </motion.div>
                  )}

                  <motion.div 
                    className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800/50 border border-zinc-700/50"
                    whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
                  >
                    <Users className="w-3 h-3 text-purple-400" />
                    <span className="text-zinc-300">{activeUsers} active</span>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Section - Controls & Model Selector */}
          <motion.div
            className="flex items-center gap-2"
            variants={itemVariants}
          >
            {/* Enhanced Control Buttons */}
            <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-800/30 border border-zinc-700/50 backdrop-blur-sm">
              <Button
                variant="ghost"
                size="sm"
                className="text-zinc-400 hover:text-white hover:bg-zinc-700/50 transition-all duration-200 group"
                onClick={onHealthCheck}
              >
                {isBackendHealthy ? (
                  <Wifi className="w-4 h-4 group-hover:scale-110 transition-transform" />
                ) : (
                  <WifiOff className="w-4 h-4 group-hover:scale-110 transition-transform" />
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="text-zinc-400 hover:text-white hover:bg-zinc-700/50 transition-all duration-200 group"
              >
                <Database className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </Button>

              <div className="w-px h-6 bg-zinc-700/50" />

              <Button
                variant="ghost"
                size="sm"
                className="text-zinc-400 hover:text-white hover:bg-zinc-700/50 transition-all duration-200 group"
                onClick={() => setShowStats(!showStats)}
              >
                <Activity className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </Button>
            </div>

            {/* Enhanced Model Selector Container */}
            <div className="w-96">
              <ModelSelector 
                selectedModel={selectedModel}
                onModelSelect={onModelSelect}
              />
            </div>
          </motion.div>
        </div>

        {/* Enhanced Tab Navigation & Stats Section */}
        <motion.div
          className="flex items-center justify-between"
          variants={itemVariants}
        >
          <div className="flex items-center gap-6">
            <ChatTabs activeTab={activeTab} onTabChange={onTabChange} />
            
            {/* Quick Stats */}
            <div className="flex items-center gap-4 text-sm text-zinc-400">
              <motion.div 
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800/30 border border-zinc-700/30"
                whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
              >
                <MessageSquare className="w-4 h-4 text-blue-400" />
                <span className="font-medium">{messages.length}</span>
                <span className="text-zinc-500">messages</span>
              </motion.div>
            </div>
          </div>

          {/* Enhanced Right Stats */}
          <div className="flex items-center gap-4">
            <motion.div 
              className="flex items-center gap-3 px-4 py-2 rounded-xl bg-zinc-800/30 border border-zinc-700/30 backdrop-blur-sm"
              whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium text-zinc-300">
                  {getModelDisplayName(selectedModel)}
                </span>
              </div>
              
              <div className="w-px h-4 bg-zinc-600" />
              
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <Clock className="w-3 h-3" />
                <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Expandable Stats Panel */}
        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0, height: 0 }}
              animate={shouldReduceMotion ? {} : { opacity: 1, height: 'auto' }}
              exit={shouldReduceMotion ? {} : { opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="mt-4 p-4 rounded-xl bg-zinc-800/20 border border-zinc-700/30 backdrop-blur-sm"
            >
              <div className="grid grid-cols-4 gap-4 text-center">
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-white">{conversations.length}</div>
                  <div className="text-xs text-zinc-400 uppercase tracking-wide">Conversations</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-green-400">{activeUsers}</div>
                  <div className="text-xs text-zinc-400 uppercase tracking-wide">Active Users</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-blue-400">{messages.length}</div>
                  <div className="text-xs text-zinc-400 uppercase tracking-wide">Total Messages</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-purple-400">
                    {Math.round((Date.now() - new Date(currentConversation?.last_message_at || Date.now()).getTime()) / (1000 * 60))}m
                  </div>
                  <div className="text-xs text-zinc-400 uppercase tracking-wide">Last Activity</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default ChatHeader
