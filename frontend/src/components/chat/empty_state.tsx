"use client"

import React from "react"
import { motion } from "framer-motion"
import { Sparkles, Zap, WifiOff, MessageCircle, Plus, ArrowRight, Bot, Lightbulb } from 'lucide-react'
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  isBackendHealthy: boolean
  onSuggestionClick: (suggestion: string) => void
  onNewChatClick?: () => void // New prop for creating new chat
}

const EmptyState: React.FC<EmptyStateProps> = ({
  isBackendHealthy,
  onSuggestionClick,
  onNewChatClick
}) => {
  const suggestions = [
    "Help me write code",
    "Explain a concept",
    "Creative writing",
    "Problem solving",
    "Data analysis",
    "Research assistance"
  ]

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-2xl mx-auto">
        {/* Animated Logo/Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "backOut" }}
          className="mb-8"
        >
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-24 h-24 mx-auto mb-6 relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 rounded-full opacity-20 blur-xl"></div>
              <div className="relative w-full h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                <Bot className="w-12 h-12 text-white" />
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Main Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent mb-3">
            Start Your AI Journey
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Choose your preferred model and begin an intelligent conversation
          </p>
          <p className="text-slate-500 text-sm mt-2">
            Add emotion tokens for personalized responses
          </p>
        </motion.div>

        {/* New Chat Button - Prominent placement */}
        {isBackendHealthy && onNewChatClick && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-12"
          >
            <Button
              onClick={onNewChatClick}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-2xl font-semibold text-lg transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105 group"
            >
              <Plus className="w-5 h-5 mr-3 group-hover:rotate-90 transition-transform duration-300" />
              Start New Chat
              <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
          </motion.div>
        )}

        {/* Connection Status */}
        {!isBackendHealthy && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-8 p-6 bg-red-900/20 border border-red-500/30 rounded-2xl backdrop-blur-sm"
          >
            <div className="flex items-center justify-center mb-3">
              <WifiOff className="w-8 h-8 text-red-400 mr-3" />
              <h3 className="text-xl font-semibold text-red-300">Backend Offline</h3>
            </div>
            <p className="text-red-200/80 leading-relaxed">
              Please ensure the backend server is running on localhost:8000
            </p>
            <div className="mt-4 flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
              <span className="text-red-300 text-sm">Attempting to reconnect...</span>
            </div>
          </motion.div>
        )}

        {/* Quick Start Suggestions */}
        {isBackendHealthy && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-center mb-6">
              <Lightbulb className="w-5 h-5 text-yellow-400 mr-2" />
              <h3 className="text-lg font-medium text-slate-300">Quick Start Ideas</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              {suggestions.map((suggestion, index) => (
                <motion.button
                  key={suggestion}
                  onClick={() => onSuggestionClick(suggestion)}
                  className="group p-4 bg-slate-800/50 hover:bg-slate-700/60 border border-slate-700 hover:border-purple-500/50 rounded-xl text-slate-300 hover:text-white transition-all duration-300 text-left backdrop-blur-sm hover:shadow-lg hover:shadow-purple-500/10"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{suggestion}</span>
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                  <div className="mt-2 h-1 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Feature Highlights */}
        {isBackendHealthy && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-12 pt-8 border-t border-slate-700/50"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="space-y-2">
                <Sparkles className="w-6 h-6 text-purple-400 mx-auto" />
                <h4 className="text-sm font-medium text-slate-300">Multiple Models</h4>
                <p className="text-xs text-slate-500">Choose from various AI models</p>
              </div>
              <div className="space-y-2">
                <MessageCircle className="w-6 h-6 text-blue-400 mx-auto" />
                <h4 className="text-sm font-medium text-slate-300">Smart Conversations</h4>
                <p className="text-xs text-slate-500">Context-aware responses</p>
              </div>
              <div className="space-y-2">
                <Zap className="w-6 h-6 text-yellow-400 mx-auto" />
                <h4 className="text-sm font-medium text-slate-300">Emotion Tokens</h4>
                <p className="text-xs text-slate-500">Personalized interaction style</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Floating particles for visual appeal */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="particle absolute w-2 h-2 bg-purple-500/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.8, 0.2],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default EmptyState
