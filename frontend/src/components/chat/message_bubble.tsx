"use client"

import React from "react"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Bot, User, ThumbsUp, ThumbsDown, RotateCcw, Copy, MoreHorizontal, FileText, RefreshCw, AlertTriangle, Circle, CheckCircle2 } from 'lucide-react'
import { toast } from "@/hooks/use-toast"
import { MarkdownComponents } from "./markdown_components"

interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  model?: string
  emotion?: string
  attachments?: File[]
  timestamp: Date
  reactions?: {
    thumbsUp: boolean
    thumbsDown: boolean
  }
  status?: "sending" | "sent" | "delivered" | "read" | "error"
  error?: string
  parentMessageId?: string
  conversationId?: number
}

interface MessageBubbleProps {
  message: Message
  index: number
  onReaction: (messageId: string, reaction: "thumbsUp" | "thumbsDown") => void
  onRetry: (messageId: string) => void
  getModelDisplayName: (model: string) => string
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  index,
  onReaction,
  onRetry,
  getModelDisplayName
}) => {
  const getStatusIcon = (status?: string, error?: string) => {
    switch (status) {
      case "sending":
        return <Circle className="w-3 h-3 text-slate-400 animate-pulse" />
      case "sent":
        return <CheckCircle2 className="w-3 h-3 text-slate-400" />
      case "delivered":
        return <CheckCircle2 className="w-3 h-3 text-blue-400" />
      case "read":
        return <CheckCircle2 className="w-3 h-3 text-green-400" />
      case "error":
        return (
          <div className="flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-red-400" />
            <span className="text-xs text-red-400" title={error}>
              Failed
            </span>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <motion.div
      className={`flex ${
        message.sender === "user" ? "justify-end" : "justify-start"
      }`}
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -30, scale: 0.9 }}
      transition={{
        delay: index * 0.05,
        duration: 0.5,
        ease: "easeOut",
      }}
      layout
    >
      <div
        className={`max-w-[75%] group ${
          message.sender === "user" ? "ml-16" : "mr-16"
        }`}
      >
        {/* Message Header */}
        <div
          className={`flex items-center gap-3 mb-3 ${
            message.sender === "user" ? "justify-end" : "justify-start"
          }`}
        >
          {message.sender === "ai" && (
            <motion.div
              className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <Bot className="w-5 h-5 text-white" />
            </motion.div>
          )}

          <div
            className={`flex items-center gap-2 ${
              message.sender === "user" ? "flex-row-reverse" : ""
            }`}
          >
            <span className="text-sm font-semibold text-white">
              {message.sender === "user" ? "You" : "Gideon"}
            </span>
            {/* {message.model && (
              <Badge
                variant="outline"
                className="border-purple-500/30 text-purple-400 text-xs bg-purple-500/10"
              >
                {getModelDisplayName(message.model)}
              </Badge>
            )} */}
            {message.emotion && (
              <Badge
                variant="outline"
                className="border-green-500/30 text-green-400 text-xs bg-green-500/10"
              >
                {message.emotion}
              </Badge>
            )}
          </div>

          {message.sender === "user" && (
            <motion.div
              className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.1, rotate: -5 }}
            >
              <User className="w-5 h-5 text-white" />
            </motion.div>
          )}
        </div>

        {/* Message Bubble */}
        <motion.div
          className={`relative p-6 rounded-3xl backdrop-blur-sm border transition-all duration-300 group-hover:shadow-xl ${
            message.sender === "user"
              ? message.status === "error"
                ? "bg-gradient-to-br from-red-600/15 to-red-500/15 border-red-500/25 group-hover:border-red-400/40 shadow-red-500/10"
                : "bg-gradient-to-br from-blue-600/15 to-cyan-500/15 border-blue-500/25 group-hover:border-blue-400/40 shadow-blue-500/10"
              : message.status === "error"
              ? "bg-red-800/60 border-red-700/50 group-hover:border-red-600/70 shadow-red-900/20"
              : "bg-slate-800/60 border-slate-700/50 group-hover:border-slate-600/70 shadow-slate-900/20"
          }`}
          whileHover={{ scale: 1.01, y: -2 }}
          transition={{ duration: 0.2 }}
        >
          {/* Message Content */}
          <div className="prose prose-invert max-w-none">
            {message.sender === "ai" ? (
              <div className="text-slate-200 leading-relaxed">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={MarkdownComponents}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="text-white leading-relaxed font-medium text-[15px] whitespace-pre-wrap">
                {message.content}
              </p>
            )}
          </div>

          {/* Error Details */}
          {message.error && (
            <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-red-300 text-sm">{message.error}</p>
              {message.sender === "user" && (
                <Button
                  onClick={() => onRetry(message.id)}
                  variant="outline"
                  size="sm"
                  className="mt-2 border-red-500/30 text-red-400 hover:bg-red-500/10"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Retry
                </Button>
              )}
            </div>
          )}

          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {message.attachments.map((file, fileIndex) => (
                <motion.div
                  key={fileIndex}
                  className="flex items-center gap-2 px-3 py-2 bg-slate-700/50 rounded-xl text-xs text-slate-300 border border-slate-600/50"
                  whileHover={{ scale: 1.05 }}
                >
                  <FileText className="w-3 h-3" />
                  {file.name}
                </motion.div>
              ))}
            </div>
          )}

          {/* Message Footer */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>{message.timestamp.toLocaleTimeString()}</span>
              {message.sender === "user" &&
                getStatusIcon(message.status, message.error)}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {message.sender === "ai" && !message.error && (
                <>
                  <motion.button
                    onClick={() => onReaction(message.id, "thumbsUp")}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      message.reactions?.thumbsUp
                        ? "bg-green-500/20 text-green-400"
                        : "bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-white"
                    }`}
                  >
                    <ThumbsUp className="w-3 h-3" />
                  </motion.button>

                  <motion.button
                    onClick={() => onReaction(message.id, "thumbsDown")}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      message.reactions?.thumbsDown
                        ? "bg-red-500/20 text-red-400"
                        : "bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-white"
                    }`}
                  >
                    <ThumbsDown className="w-3 h-3" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 180 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 rounded-lg bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-white transition-all duration-200"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </motion.button>
                </>
              )}

              <motion.button
                onClick={() => {
                  navigator.clipboard.writeText(message.content)
                  toast({
                    title: "Copied",
                    description: "Message copied to clipboard",
                  })
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-white transition-all duration-200"
              >
                <Copy className="w-3 h-3" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-white transition-all duration-200"
              >
                <MoreHorizontal className="w-3 h-3" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default MessageBubble
