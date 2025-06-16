"use client"

import React from "react"
import { motion, useTransform } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bot, MessageSquare, Wifi, WifiOff, Database, Settings, Shield, Clock } from 'lucide-react'
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
  return (
    <motion.div
      className="chat-header fixed z-50 border-b border-slate-800/50 backdrop-blur-xl"
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
              onClick={onTreeToggle}
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
                  {conversations.find((c) => c.id === currentConversationId)
                    ?.room_name || "AI Chat Studio"}
                </h1>
                <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isBackendHealthy
                        ? "bg-green-400 animate-pulse"
                        : "bg-red-400"
                    }`}
                  />
                  {isBackendHealthy
                    ? "Connected to backend"
                    : "Backend offline"}
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
                onClick={onHealthCheck}
              >
                {isBackendHealthy ? (
                  <Wifi className="w-4 h-4" />
                ) : (
                  <WifiOff className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white"
              >
                <Database className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
            <ModelSelector
              selectedModel={selectedModel}
              onModelSelect={onModelSelect}
            />
          </motion.div>
        </div>

        {/* Tab Navigation with Stats */}
        <motion.div
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <ChatTabs activeTab={activeTab} onTabChange={onTabChange} />

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
  )
}

export default ChatHeader
