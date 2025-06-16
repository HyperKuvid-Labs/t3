"use client"

import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bot } from 'lucide-react'

interface TypingIndicatorProps {
  isTyping: boolean
  modelName: string
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ isTyping, modelName }) => {
  return (
    <AnimatePresence>
      {isTyping && (
        <motion.div
          className="flex justify-start mr-16"
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.9 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-3">
            <motion.div
              className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center shadow-lg"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{
                duration: 1,
                repeat: Number.POSITIVE_INFINITY,
              }}
            >
              <Bot className="w-5 h-5 text-white" />
            </motion.div>
            <div className="p-4 rounded-3xl bg-slate-800/60 border border-slate-700/50 backdrop-blur-sm">
              <div className="flex items-center gap-1">
                <span className="text-sm text-slate-400 mr-2">
                  {modelName} is thinking
                </span>
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-purple-400 rounded-full"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default TypingIndicator
    