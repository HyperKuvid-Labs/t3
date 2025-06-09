"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Send, Paperclip, Mic, MoreHorizontal, Sparkles, Brain, Zap, Bot } from "lucide-react"

interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
  model?: string
  isCode?: boolean
}

export function InteractiveChatMockup() {
  const [currentModel, setCurrentModel] = useState("Gemini 2.5 Flash")
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Explain quantum computing in simple terms",
      sender: "user",
      timestamp: new Date(),
    },
    {
      id: "2",
      content:
        "Quantum computing harnesses quantum mechanics to process information in revolutionary ways. Unlike classical bits that are either 0 or 1, quantum bits (qubits) can exist in superposition - being both 0 and 1 simultaneously until measured.",
      sender: "ai",
      timestamp: new Date(),
      model: "Gemini 2.5 Flash",
    },
    {
      id: "3",
      content: "Can you show me a simple quantum algorithm?",
      sender: "user",
      timestamp: new Date(),
    },
  ])

  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const models = [
    { name: "Gemini 2.5 Flash", color: "bg-blue-500", emoji: "⚡", icon: Zap },
    { name: "Gemini 2.5 Pro", color: "bg-green-500", emoji: "🧠", icon: Brain },
    { name: "Claude 3.5", color: "bg-purple-500", emoji: "🎭", icon: Sparkles },
    { name: "Ollama", color: "bg-orange-500", emoji: "🦙", icon: Bot },
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentModel((prev) => {
        const currentIndex = models.findIndex((m) => m.name === prev)
        return models[(currentIndex + 1) % models.length].name
      })
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)
    setIsStreaming(true)

    // Simulate AI response
    setTimeout(() => {
      setIsTyping(false)

      const responses = [
        "Here's a simple quantum algorithm example:\n\n```python\ndef quantum_teleportation():\n    # Create entangled qubits\n    qubits = create_bell_pair()\n    # Perform quantum operations\n    return measure(qubits)\n```\n\nThis demonstrates quantum teleportation, where quantum information is transferred between qubits using entanglement.",
        "Great question! Let me break this down step by step with a practical example that shows the power of quantum computing.",
        "I'll create a visual representation of this concept. Quantum algorithms leverage superposition and entanglement to solve problems exponentially faster than classical computers.",
      ]

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: responses[Math.floor(Math.random() * responses.length)],
        sender: "ai",
        timestamp: new Date(),
        model: currentModel,
        isCode: Math.random() > 0.5,
      }

      setMessages((prev) => [...prev, aiMessage])
      setIsStreaming(false)
    }, 2000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const currentModelData = models.find((m) => m.name === currentModel)

  return (
    <div className="relative max-w-md mx-auto">
      {/* Floating Model Selector */}
      <div className="absolute -top-6 left-4 z-10">
        <Badge
          variant="secondary"
          className="bg-background/90 backdrop-blur-xl border shadow-xl shadow-black/10 px-3 py-2 transition-all duration-300 hover:scale-105"
        >
          <div className="flex items-center space-x-2">
            {currentModelData && <currentModelData.icon className="w-4 h-4" />}
            <span className="font-medium">{currentModel}</span>
          </div>
        </Badge>
      </div>

      {/* Chat Interface */}
      <Card className="bg-background/80 backdrop-blur-xl border shadow-2xl shadow-black/20 overflow-hidden hover:shadow-3xl transition-all duration-500">
        {/* Header */}
        <div className="p-4 border-b bg-gradient-to-r from-violet-50/50 to-purple-50/50 dark:from-violet-950/30 dark:to-purple-950/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex space-x-1">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <div
                  className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"
                  style={{ animationDelay: "0.5s" }}
                ></div>
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: "1s" }}></div>
              </div>
              <div className="text-sm font-medium text-muted-foreground">Gidvion Chat</div>
            </div>
            <Button variant="ghost" size="icon" className="w-6 h-6 hover:bg-violet-100 dark:hover:bg-violet-900/30">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="p-4 space-y-4 h-96 overflow-y-auto custom-scrollbar">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"} animate-fade-in-up`}
            >
              <div
                className={`max-w-xs rounded-2xl px-4 py-3 transition-all duration-300 hover:scale-105 ${
                  message.sender === "user"
                    ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-br-md shadow-lg shadow-violet-500/25"
                    : "bg-muted/80 backdrop-blur-sm rounded-bl-md border shadow-sm"
                }`}
              >
                {message.sender === "ai" && message.model && (
                  <div className="text-xs text-muted-foreground mb-2 flex items-center space-x-1">
                    <Sparkles className="w-3 h-3" />
                    <span>{message.model}</span>
                  </div>
                )}

                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>

                {message.isCode && message.sender === "ai" && (
                  <div className="mt-3 p-3 bg-background/50 rounded-lg border text-xs font-mono">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-violet-600 font-semibold">Python</span>
                      <Button variant="ghost" size="sm" className="h-6 text-xs">
                        Copy
                      </Button>
                    </div>
                    <div className="text-muted-foreground">
                      <span className="text-blue-600">def</span> quantum_example():
                      <br />
                      &nbsp;&nbsp;<span className="text-green-600">return</span>{" "}
                      <span className="text-orange-600">"superposition"</span>
                    </div>
                  </div>
                )}

                <div className="text-xs opacity-70 mt-2">
                  {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start animate-fade-in">
              <div className="bg-muted/80 backdrop-blur-sm rounded-2xl rounded-bl-md px-4 py-3 border">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-violet-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-violet-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                  <span className="text-xs text-muted-foreground">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t bg-gradient-to-r from-violet-50/30 to-purple-50/30 dark:from-violet-950/20 dark:to-purple-950/20">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="w-9 h-9 hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors"
            >
              <Paperclip className="w-4 h-4" />
            </Button>

            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Ask Gidvion anything..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full bg-background/80 backdrop-blur-sm rounded-full px-4 py-3 border border-border/50 outline-none text-sm focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all duration-300"
                disabled={isStreaming}
              />
              {isStreaming && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="w-9 h-9 hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors"
            >
              <Mic className="w-4 h-4" />
            </Button>

            <Button
              size="icon"
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isStreaming}
              className="w-9 h-9 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Floating Animation Elements */}
      <div className="absolute -z-10 top-10 -right-10 w-20 h-20 bg-violet-500/20 rounded-full blur-xl animate-float"></div>
      <div
        className="absolute -z-10 bottom-10 -left-10 w-16 h-16 bg-purple-500/20 rounded-full blur-xl animate-float"
        style={{ animationDelay: "1s" }}
      ></div>
      <div
        className="absolute -z-10 top-1/2 -right-16 w-12 h-12 bg-blue-500/20 rounded-full blur-xl animate-float"
        style={{ animationDelay: "2s" }}
      ></div>
    </div>
  )
}
