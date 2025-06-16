"use client"

import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Paperclip, Search, Sparkles, X, FileText, Zap, Copy, Star, Heart, Smile } from 'lucide-react'
import EmotionTokenPanel from "./EmotionTokenPanel"
import FileAttachments from "./file_attatchments"
import QuickActionsPanel from "./quick_Actions_panel"

interface ChatUser {
  id: string
  username: string
  email: string
}

interface ChatInputProps {
  inputValue: string
  attachedFiles: File[]
  selectedEmotion: string | null
  showQuickActions: boolean
  isBackendHealthy: boolean
  currentUser: ChatUser | null
  isTyping: boolean
  webSearchEnabled: boolean
  onInputChange: (value: string) => void
  onSendMessage: () => void
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveFile: (index: number) => void
  onEmotionSelect: (emotion: string | null) => void
  onToggleQuickActions: () => void
  onToggleWebSearch: () => void
  onKeyPress: (e: React.KeyboardEvent) => void
}

const ChatInput: React.FC<ChatInputProps> = ({
  inputValue,
  attachedFiles,
  selectedEmotion,
  showQuickActions,
  isBackendHealthy,
  currentUser,
  isTyping,
  webSearchEnabled,
  onInputChange,
  onSendMessage,
  onFileUpload,
  onRemoveFile,
  onEmotionSelect,
  onToggleQuickActions,
  onToggleWebSearch,
  onKeyPress
}) => {
  return (
    <motion.div
      className="chat-input fixed bottom-0 left-0 right-0 z-50 border-t border-slate-800/50 backdrop-blur-xl bg-slate-900/50"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.8 }}
    >
      <div className="max-w-6xl mx-auto p-6">
        {/* File Attachments Preview */}
        <FileAttachments 
          attachedFiles={attachedFiles}
          onRemoveFile={onRemoveFile}
        />

        {/* Input Controls */}
        <div className="flex gap-4 items-end">
          {/* Left Controls */}
          <div className="flex gap-3">
            <EmotionTokenPanel
              selectedEmotion={selectedEmotion}
              onEmotionSelect={onEmotionSelect}
            />

            {/* File Upload */}
            <div className="relative">
              <input
                type="file"
                multiple
                onChange={onFileUpload}
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

            {/* Web Search Toggle */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleWebSearch}
                disabled={!isBackendHealthy}
                className={`h-12 px-4 transition-all duration-200 disabled:opacity-50 ${
                  webSearchEnabled
                    ? "border-blue-500/50 bg-blue-500/10 text-blue-400"
                    : "border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                <Search className="w-4 h-4" />
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
                onClick={onToggleQuickActions}
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
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyPress={onKeyPress}
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
              style={{ minHeight: "48px", maxHeight: "120px" }}
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
              onClick={onSendMessage}
              disabled={
                (!inputValue.trim() && attachedFiles.length === 0) ||
                !isBackendHealthy ||
                !currentUser ||
                isTyping
              }
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
        <QuickActionsPanel 
          showQuickActions={showQuickActions}
          isBackendHealthy={isBackendHealthy}
          onActionSelect={(action) => {
            onInputChange(action)
            onToggleQuickActions()
          }}
        />
      </div>
    </motion.div>
  )
}

export default ChatInput
