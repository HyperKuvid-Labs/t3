"use client"

import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Zap, Copy, Star, Heart, Smile } from 'lucide-react'

interface QuickActionsPanelProps {
  showQuickActions: boolean
  isBackendHealthy: boolean
  onActionSelect: (action: string) => void
}

const QuickActionsPanel: React.FC<QuickActionsPanelProps> = ({
  showQuickActions,
  isBackendHealthy,
  onActionSelect
}) => {
  const quickActions = [
    {
      icon: Copy,
      label: "Summarize",
      action: "Please summarize the above conversation",
    },
    {
      icon: Star,
      label: "Improve",
      action: "How can I improve this?",
    },
    {
      icon: Heart,
      label: "Explain",
      action: "Please explain this in simple terms",
    },
    {
      icon: Smile,
      label: "Continue",
      action: "Please continue with this topic",
    },
  ]

  return (
    <AnimatePresence>
      {showQuickActions && isBackendHealthy && (
        <motion.div
          className="mt-4 p-4 bg-slate-800/60 rounded-2xl border border-slate-700/50 backdrop-blur-sm"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium text-white">
              Quick Actions
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((item, index) => (
              <motion.button
                key={item.label}
                onClick={() => onActionSelect(item.action)}
                className="flex items-center gap-2 px-3 py-2 bg-slate-700/50 hover:bg-slate-600/50 rounded-xl text-sm text-slate-300 hover:text-white transition-all duration-200"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default QuickActionsPanel
