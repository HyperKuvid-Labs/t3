"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Send, Paperclip, Mic, MoreHorizontal } from "lucide-react"

export function ChatMockup() {
  const [currentModel, setCurrentModel] = useState("Gemini 2.5 Flash")
  const [isTyping, setIsTyping] = useState(false)

  const models = [
    { name: "Gemini 2.5 Flash", color: "bg-blue-500", emoji: "⚡" },
    { name: "Gemini 2.5 Pro", color: "bg-green-500", emoji: "🧠" },
    { name: "Claude 3.5", color: "bg-purple-500", emoji: "🎭" },
    { name: "Ollama", color: "bg-orange-500", emoji: "🦙" },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentModel((prev) => {
        const currentIndex = models.findIndex((m) => m.name === prev)
        return models[(currentIndex + 1) % models.length].name
      })
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative max-w-md mx-auto">
      {/* Floating Model Selector */}
      <div className="absolute -top-4 left-4 z-10">
        <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm border shadow-lg">
          {models.find((m) => m.name === currentModel)?.emoji} {currentModel}
        </Badge>
      </div>

      {/* Chat Interface */}
      <Card className="bg-background/50 backdrop-blur-sm border shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <Button variant="ghost" size="icon" className="w-6 h-6">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="p-4 space-y-4 h-80 overflow-y-auto">
          {/* User Message */}
          <div className="flex justify-end">
            <div className="bg-blue-600 text-white rounded-2xl rounded-br-md px-4 py-2 max-w-xs">
              <p className="text-sm">Explain quantum computing in simple terms</p>
            </div>
          </div>

          {/* AI Response */}
          <div className="flex justify-start">
            <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-2 max-w-xs">
              <p className="text-sm">
                Quantum computing uses quantum mechanics to process information in ways that classical computers
                cannot...
              </p>
              <div className="mt-2 p-2 bg-background rounded border text-xs font-mono">
                <span className="text-blue-600">def</span> quantum_example():
                <br />
                &nbsp;&nbsp;<span className="text-green-600">return</span> "superposition"
              </div>
            </div>
          </div>

          {/* File Upload Message */}
          <div className="flex justify-end">
            <div className="bg-blue-600 text-white rounded-2xl rounded-br-md px-4 py-2 max-w-xs">
              <div className="flex items-center space-x-2 text-sm">
                <Paperclip className="w-4 h-4" />
                <span>research_paper.pdf</span>
              </div>
              <p className="text-sm mt-1">Summarize this paper</p>
            </div>
          </div>

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t bg-muted/30">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <Paperclip className="w-4 h-4" />
            </Button>
            <div className="flex-1 bg-background rounded-full px-4 py-2 border">
              <input
                type="text"
                placeholder="Ask anything..."
                className="w-full bg-transparent outline-none text-sm"
                onFocus={() => setIsTyping(true)}
                onBlur={() => setIsTyping(false)}
              />
            </div>
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <Mic className="w-4 h-4" />
            </Button>
            <Button size="icon" className="w-8 h-8 bg-blue-600 hover:bg-blue-700">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Floating Animation Elements */}
      <div className="absolute -z-10 top-10 -right-10 w-20 h-20 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
      <div
        className="absolute -z-10 bottom-10 -left-10 w-16 h-16 bg-purple-500/20 rounded-full blur-xl animate-pulse"
        style={{ animationDelay: "1s" }}
      ></div>
    </div>
  )
}
