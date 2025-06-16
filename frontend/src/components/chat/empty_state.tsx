"use client"

import React from "react"
import { motion } from "framer-motion"
import { Sparkles, Zap, WifiOff } from 'lucide-react'

interface EmptyStateProps {
  isBackendHealthy: boolean
  onSuggestionClick: (suggestion: string) => void
}

const EmptyState: React.FC<EmptyStateProps> = ({
  isBackendHealthy,
  onSuggestionClick
}) => {
  const suggestions = [
    "Help me write code",
    "Explain a concept",
    "Creative writing",
    "Problem solving",
  ]

  return (
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
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 4,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
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
          {suggestions.map((suggestion, index) => (
            <motion.button
              key={suggestion}
              onClick={() => onSuggestionClick(suggestion)}
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
  )
}

export default EmptyState
